import mongoose, { Schema } from 'mongoose';
import { ISubscription, SubscriptionStatus } from '../../../types';

const subscriptionSchema = new Schema<ISubscription>({
  userId: {
    type: String,
    required: [true, 'User ID is required'],
    ref: 'User'
  },
  planId: {
    type: String,
    required: [true, 'Plan ID is required'],
    ref: 'PaymentPlan'
  },
  status: {
    type: String,
    enum: Object.values(SubscriptionStatus),
    default: SubscriptionStatus.PENDING,
    required: true
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  currentSemester: {
    type: Number,
    default: 0,
    min: [0, 'Current semester cannot be negative'],
    max: [4, 'Current semester cannot exceed 4']
  },
  totalAmountPaid: {
    type: Number,
    default: 0,
    min: [0, 'Total amount paid cannot be negative']
  },
  amountRemaining: {
    type: Number,
    required: [true, 'Amount remaining is required'],
    min: [0, 'Amount remaining cannot be negative']
  },
  nextPaymentDue: {
    type: Date
  },
  nextPaymentAmount: {
    type: Number,
    min: [0, 'Next payment amount cannot be negative']
  },
  autoRenew: {
    type: Boolean,
    default: false
  },
  lastPaymentDate: {
    type: Date
  },
  cancelledAt: {
    type: Date
  },
  cancellationReason: {
    type: String,
    trim: true
  },
  metadata: {
    type: Schema.Types.Mixed,
    default: {}
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
subscriptionSchema.index({ userId: 1 });
subscriptionSchema.index({ planId: 1 });
subscriptionSchema.index({ status: 1 });
subscriptionSchema.index({ userId: 1, status: 1 });
subscriptionSchema.index({ nextPaymentDue: 1 });
subscriptionSchema.index({ createdAt: -1 });

// Instance method to check if subscription is active
subscriptionSchema.methods.isActive = function(): boolean {
  return this.status === SubscriptionStatus.ACTIVE && this.endDate > new Date();
};

// Instance method to check if payment is due
subscriptionSchema.methods.isPaymentDue = function(): boolean {
  if (!this.nextPaymentDue) return false;
  return this.nextPaymentDue <= new Date();
};

// Static method to find active subscriptions for a user
subscriptionSchema.statics.findActiveByUserId = function(userId: string) {
  return this.findOne({ 
    userId, 
    status: SubscriptionStatus.ACTIVE,
    endDate: { $gt: new Date() }
  });
};

// Static method to find subscriptions with due payments
subscriptionSchema.statics.findDuePayments = function() {
  return this.find({
    status: SubscriptionStatus.ACTIVE,
    nextPaymentDue: { $lte: new Date() }
  });
};

export const Subscription = mongoose.model<ISubscription>('Subscription', subscriptionSchema);
export default Subscription;

