import mongoose, { Schema } from 'mongoose';
import { IPaymentPlan, PaymentPlanType } from '../../../types';

const paymentPlanSchema = new Schema<IPaymentPlan>({
  name: {
    type: String,
    required: [true, 'Plan name is required'],
    trim: true
  },
  type: {
    type: String,
    enum: Object.values(PaymentPlanType),
    required: [true, 'Plan type is required'],
    unique: true
  },
  description: {
    type: String,
    required: [true, 'Plan description is required'],
    trim: true
  },
  totalAmount: {
    type: Number,
    required: [true, 'Total amount is required'],
    min: [0, 'Total amount cannot be negative']
  },
  installmentAmount: {
    type: Number,
    required: [true, 'Installment amount is required'],
    min: [0, 'Installment amount cannot be negative']
  },
  numberOfInstallments: {
    type: Number,
    required: [true, 'Number of installments is required'],
    min: [1, 'Number of installments must be at least 1']
  },
  semestersPerInstallment: {
    type: Number,
    required: [true, 'Semesters per installment is required'],
    min: [1, 'Semesters per installment must be at least 1']
  },
  isActive: {
    type: Boolean,
    default: true
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
// type already has unique index from field definition
paymentPlanSchema.index({ isActive: 1 });

// Static method to get active plans
paymentPlanSchema.statics.getActivePlans = function() {
  return this.find({ isActive: true });
};

// Static method to get plan by type
paymentPlanSchema.statics.getByType = function(type: PaymentPlanType) {
  return this.findOne({ type, isActive: true });
};

export const PaymentPlan = mongoose.model<IPaymentPlan>('PaymentPlan', paymentPlanSchema);
export default PaymentPlan;

