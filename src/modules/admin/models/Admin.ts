import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../../../config';
import { 
  IAdmin, 
  AdminRole, 
  AdminStatus, 
  AdminPermission, 
  CreateAdminData, 
  DEFAULT_ADMIN_PERMISSIONS 
} from '../../../types';

const adminSchema = new Schema<IAdmin>({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    minlength: [2, 'First name must be at least 2 characters long'],
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    minlength: [2, 'Last name must be at least 2 characters long'],
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
    match: [
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      'Please provide a valid email address'
    ]
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long'],
    select: false // Don't include password in queries by default
  },
  role: {
    type: String,
    enum: Object.values(AdminRole),
    default: AdminRole.ADMIN,
    required: [true, 'Admin role is required']
  },
  status: {
    type: String,
    enum: Object.values(AdminStatus),
    default: AdminStatus.ACTIVE,
    required: true
  },
  permissions: {
    type: [String],
    enum: Object.values(AdminPermission),
    default: function() {
      // Set default permissions based on role
      return DEFAULT_ADMIN_PERMISSIONS[this.role as AdminRole] || [];
    }
  },
  phoneNumber: {
    type: String,
    trim: true,
    match: [
      /^[\+]?[1-9][\d]{0,15}$/,
      'Please provide a valid phone number'
    ]
  },
  profilePicture: {
    type: String,
    trim: true
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: {
    type: String,
    select: false
  },
  passwordResetToken: {
    type: String,
    select: false
  },
  passwordResetExpires: {
    type: Date,
    select: false
  },
  lastLogin: {
    type: Date
  },
  refreshTokens: {
    type: [String],
    default: [],
    select: false
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'Admin',
    required: false
  },
  lastModifiedBy: {
    type: Schema.Types.ObjectId,
    ref: 'Admin',
    required: false
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete (ret as any).password;
      delete (ret as any).emailVerificationToken;
      delete (ret as any).passwordResetToken;
      delete (ret as any).passwordResetExpires;
      delete (ret as any).refreshTokens;
      delete (ret as any).__v;
      return ret;
    }
  }
});

// Indexes for better query performance
adminSchema.index({ email: 1 }, { unique: true });
adminSchema.index({ role: 1 });
adminSchema.index({ status: 1 });
adminSchema.index({ permissions: 1 });
adminSchema.index({ createdAt: -1 });
adminSchema.index({ createdBy: 1 });

// Pre-save middleware to hash password
adminSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();

  try {
    // Hash password with cost of 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Pre-save middleware to set permissions based on role
adminSchema.pre('save', function(next) {
  if (this.isModified('role') && !this.isModified('permissions')) {
    this.permissions = DEFAULT_ADMIN_PERMISSIONS[this.role] || [];
  }
  next();
});

// Instance method to compare password
adminSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Instance method to generate refresh token
adminSchema.methods.generateRefreshToken = function(): string {
  const payload = {
    adminId: this._id.toString(),
    role: this.role,
    tokenVersion: Date.now() // Simple token versioning
  };
  
  return jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpire
  } as jwt.SignOptions);
};

// Instance method to remove refresh token
adminSchema.methods.removeRefreshToken = function(token: string): void {
  this.refreshTokens = this.refreshTokens.filter((t: string) => t !== token);
};

// Instance method to check if admin has specific permission
adminSchema.methods.hasPermission = function(permission: AdminPermission): boolean {
  return this.permissions.includes(permission);
};

// Static method to create admin
adminSchema.statics.createAdmin = async function(adminData: CreateAdminData): Promise<IAdmin> {
  const admin = new this(adminData);
  await admin.save();
  return admin;
};

// Static method to find admin by email
adminSchema.statics.findByEmail = function(email: string) {
  return this.findOne({ email: email.toLowerCase() });
};

// Static method to find admins by role
adminSchema.statics.findByRole = function(role: AdminRole) {
  return this.find({ role, status: AdminStatus.ACTIVE });
};

// Static method to find admins with specific permission
adminSchema.statics.findByPermission = function(permission: AdminPermission) {
  return this.find({ 
    permissions: permission, 
    status: AdminStatus.ACTIVE 
  });
};

// Virtual for full name
adminSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Ensure virtual fields are serialized
adminSchema.set('toJSON', { virtuals: true });
adminSchema.set('toObject', { virtuals: true });

export const Admin = mongoose.model<IAdmin>('Admin', adminSchema);
export default Admin;
