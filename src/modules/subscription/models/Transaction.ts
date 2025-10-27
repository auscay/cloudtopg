import mongoose, { Schema } from 'mongoose';
import { ITransaction, TransactionStatus, PaymentMethod } from '../../../types';

const transactionSchema = new Schema<ITransaction>({
  userId: {
    type: String,
    required: [true, 'User ID is required'],
    ref: 'User'
  },
  subscriptionId: {
    type: String,
    ref: 'Subscription'
  },
  planId: {
    type: String,
    ref: 'PaymentPlan'
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  currency: {
    type: String,
    default: 'NGN',
    uppercase: true
  },
  status: {
    type: String,
    enum: Object.values(TransactionStatus),
    default: TransactionStatus.PENDING,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: Object.values(PaymentMethod)
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
transactionSchema.index({ userId: 1 });
transactionSchema.index({ subscriptionId: 1 });
// paystackReference already has unique index from field definition
transactionSchema.index({ status: 1 });
transactionSchema.index({ createdAt: -1 });
transactionSchema.index({ userId: 1, status: 1 });

// Static method to find transactions by user
transactionSchema.statics.findByUserId = function(userId: string) {
  return this.find({ userId }).sort({ createdAt: -1 });
};

// Static method to find transactions by subscription
transactionSchema.statics.findBySubscriptionId = function(subscriptionId: string) {
  return this.find({ subscriptionId }).sort({ createdAt: -1 });
};

// Static method to find transaction by reference
transactionSchema.statics.findByReference = function(reference: string) {
  return this.findOne({ paystackReference: reference });
};

// Static method to find successful transactions
transactionSchema.statics.findSuccessful = function() {
  return this.find({ status: TransactionStatus.SUCCESS }).sort({ createdAt: -1 });
};

export const Transaction = mongoose.model<ITransaction>('Transaction', transactionSchema);
export default Transaction;

