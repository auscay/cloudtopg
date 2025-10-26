import { Types } from 'mongoose';
import { BaseRepository } from '../../user/repositories/BaseRepository';
import { Admin } from '../models/Admin';
import { IAdmin, AdminRole, AdminStatus, AdminPermission, CreateAdminData, UpdateAdminData, AdminStats } from '../../../types';

export class AdminRepository extends BaseRepository<IAdmin> {
  constructor() {
    super(Admin);
  }

  /**
   * Find admin by email
   */
  async findByEmail(email: string): Promise<IAdmin | null> {
    return await this.model.findOne({ email: email.toLowerCase() });
  }

  /**
   * Find admin by email with password (for login)
   */
  async findByEmailWithPassword(email: string): Promise<IAdmin | null> {
    return await this.model.findOne({ email: email.toLowerCase() }).select('+password');
  }

  /**
   * Find admins by role
   */
  async findByRole(role: AdminRole): Promise<IAdmin[]> {
    return await this.model.find({ role, status: AdminStatus.ACTIVE });
  }

  /**
   * Find admins with specific permission
   */
  async findByPermission(permission: AdminPermission): Promise<IAdmin[]> {
    return await this.model.find({ 
      permissions: permission, 
      status: AdminStatus.ACTIVE 
    });
  }

  /**
   * Find active admins
   */
  async findActiveAdmins(): Promise<IAdmin[]> {
    return await this.model.find({ status: AdminStatus.ACTIVE });
  }

  /**
   * Find admins created by specific admin
   */
  async findByCreatedBy(createdBy: string | Types.ObjectId): Promise<IAdmin[]> {
    return await this.model.find({ createdBy });
  }

  /**
   * Create admin with creator tracking
   */
  async createAdmin(adminData: CreateAdminData, createdBy?: string | Types.ObjectId): Promise<IAdmin> {
    const admin = new this.model({
      ...adminData,
      createdBy: createdBy || null
    });
    return await admin.save();
  }

  /**
   * Update admin with modifier tracking
   */
  async updateAdmin(
    id: string | Types.ObjectId, 
    updateData: UpdateAdminData, 
    modifiedBy?: string | Types.ObjectId
  ): Promise<IAdmin | null> {
    return await this.model.findByIdAndUpdate(
      id, 
      { 
        ...updateData, 
        lastModifiedBy: modifiedBy || null 
      }, 
      { new: true, runValidators: true }
    );
  }

  /**
   * Update admin status
   */
  async updateStatus(
    id: string | Types.ObjectId, 
    status: AdminStatus, 
    modifiedBy?: string | Types.ObjectId
  ): Promise<IAdmin | null> {
    return await this.model.findByIdAndUpdate(
      id, 
      { 
        status, 
        lastModifiedBy: modifiedBy || null 
      }, 
      { new: true, runValidators: true }
    );
  }

  /**
   * Update admin permissions
   */
  async updatePermissions(
    id: string | Types.ObjectId, 
    permissions: AdminPermission[], 
    modifiedBy?: string | Types.ObjectId
  ): Promise<IAdmin | null> {
    return await this.model.findByIdAndUpdate(
      id, 
      { 
        permissions, 
        lastModifiedBy: modifiedBy || null 
      }, 
      { new: true, runValidators: true }
    );
  }

  /**
   * Update last login
   */
  async updateLastLogin(id: string | Types.ObjectId): Promise<IAdmin | null> {
    return await this.model.findByIdAndUpdate(
      id, 
      { lastLogin: new Date() }, 
      { new: true }
    );
  }

  /**
   * Add refresh token
   */
  async addRefreshToken(id: string | Types.ObjectId, token: string): Promise<IAdmin | null> {
    return await this.model.findByIdAndUpdate(
      id, 
      { $push: { refreshTokens: token } }, 
      { new: true }
    );
  }

  /**
   * Remove refresh token
   */
  async removeRefreshToken(id: string | Types.ObjectId, token: string): Promise<IAdmin | null> {
    return await this.model.findByIdAndUpdate(
      id, 
      { $pull: { refreshTokens: token } }, 
      { new: true }
    );
  }

  /**
   * Clear all refresh tokens
   */
  async clearRefreshTokens(id: string | Types.ObjectId): Promise<IAdmin | null> {
    return await this.model.findByIdAndUpdate(
      id, 
      { refreshTokens: [] }, 
      { new: true }
    );
  }

  /**
   * Set password reset token
   */
  async setPasswordResetToken(
    id: string | Types.ObjectId, 
    token: string, 
    expires: Date
  ): Promise<IAdmin | null> {
    return await this.model.findByIdAndUpdate(
      id, 
      { 
        passwordResetToken: token, 
        passwordResetExpires: expires 
      }, 
      { new: true }
    );
  }

  /**
   * Clear password reset token
   */
  async clearPasswordResetToken(id: string | Types.ObjectId): Promise<IAdmin | null> {
    return await this.model.findByIdAndUpdate(
      id, 
      { 
        $unset: { 
          passwordResetToken: 1, 
          passwordResetExpires: 1 
        } 
      }, 
      { new: true }
    );
  }

  /**
   * Set email verification token
   */
  async setEmailVerificationToken(id: string | Types.ObjectId, token: string): Promise<IAdmin | null> {
    return await this.model.findByIdAndUpdate(
      id, 
      { emailVerificationToken: token }, 
      { new: true }
    );
  }

  /**
   * Verify email
   */
  async verifyEmail(id: string | Types.ObjectId): Promise<IAdmin | null> {
    return await this.model.findByIdAndUpdate(
      id, 
      { 
        isEmailVerified: true, 
        $unset: { emailVerificationToken: 1 } 
      }, 
      { new: true }
    );
  }

  /**
   * Get admin statistics
   */
  async getStats(): Promise<AdminStats> {
    const [
      totalAdmins,
      activeAdmins,
      inactiveAdmins,
      suspendedAdmins,
      superAdmins,
      regularAdmins,
      moderators
    ] = await Promise.all([
      this.count(),
      this.count({ status: AdminStatus.ACTIVE }),
      this.count({ status: AdminStatus.INACTIVE }),
      this.count({ status: AdminStatus.SUSPENDED }),
      this.count({ role: AdminRole.SUPER_ADMIN }),
      this.count({ role: AdminRole.ADMIN }),
      this.count({ role: AdminRole.MODERATOR })
    ]);

    return {
      totalAdmins,
      activeAdmins,
      inactiveAdmins,
      suspendedAdmins,
      superAdmins,
      regularAdmins,
      moderators
    };
  }

  /**
   * Search admins by name or email
   */
  async searchAdmins(searchTerm: string, limit: number = 10): Promise<IAdmin[]> {
    const regex = new RegExp(searchTerm, 'i');
    return await this.model.find({
      $or: [
        { firstName: regex },
        { lastName: regex },
        { email: regex }
      ]
    }).limit(limit);
  }

  /**
   * Get admins with pagination
   */
  async getAdminsWithPagination(
    page: number = 1, 
    limit: number = 10, 
    filters: any = {}
  ): Promise<{ admins: IAdmin[]; total: number; pages: number }> {
    const skip = (page - 1) * limit;
    
    const [admins, total] = await Promise.all([
      this.model.find(filters).skip(skip).limit(limit).sort({ createdAt: -1 }),
      this.count(filters)
    ]);

    return {
      admins,
      total,
      pages: Math.ceil(total / limit)
    };
  }
}
