import mongoose, { Schema } from 'mongoose';
import { IApplicationFee, ApplicationFeeStatus } from '../../../types';

const applicationFeeSchema = new Schema<IApplicationFee>({
  userId: {
    type: String,
    required: [true, 'User ID is required'],
    ref: 'User'
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    default: 20000, // ₦20,000
    min: [0, 'Amount cannot be negative']
  },
  currency: {
    type: String,
    default: 'NGN',
    uppercase: true
  },
  status: {
    type: String,
    enum: Object.values(ApplicationFeeStatus),
    default: ApplicationFeeStatus.PENDING,
    required: true
  },
  paystackReference: {
    type: String,
    required: [true, 'Paystack reference is required'],
    unique: true
  },
  paystackAccessCode: {
    type: String
  },
  paystackAuthorizationUrl: {
    type: String
  },
  paymentMethod: {
    type: String
  },
  paymentDate: {
    type: Date
  },
  metadata: {
    type: Schema.Types.Mixed,
    default: {}
  },
  failureReason: {
    type: String,
    trim: true
  },
  refundedAt: {
    type: Date
  },
  refundReason: {
    type: String,
    trim: true
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete (ret as any).__v;
      return ret;
    }
  }
});

// Indexes
applicationFeeSchema.index({ userId: 1 });
// paystackReference already has unique index from field definition
applicationFeeSchema.index({ status: 1 });
applicationFeeSchema.index({ createdAt: -1 });
applicationFeeSchema.index({ userId: 1, status: 1 });

// Static method to find by user
applicationFeeSchema.statics.findByUserId = function(userId: string) {
  return this.findOne({ userId }).sort({ createdAt: -1 });
};

// Static method to find by reference
applicationFeeSchema.statics.findByReference = function(reference: string) {
  return this.findOne({ paystackReference: reference });
};

// Static method to check if user has paid
applicationFeeSchema.statics.hasUserPaid = async function(userId: string): Promise<boolean> {
  const payment = await this.findOne({ 
    userId, 
    status: ApplicationFeeStatus.PAID 
  });
  return !!payment;
};

export const ApplicationFee = mongoose.model<IApplicationFee>('ApplicationFee', applicationFeeSchema);
export default ApplicationFee;

