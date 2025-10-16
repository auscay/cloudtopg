import { Document } from 'mongoose';

export enum ApplicationFeeStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
  REFUNDED = 'refunded'
}

export interface IApplicationFee extends Document {
  userId: string;
  amount: number;
  currency: string;
  status: ApplicationFeeStatus;
  paystackReference: string;
  paystackAccessCode?: string;
  paystackAuthorizationUrl?: string;
  paymentMethod?: string;
  paymentDate?: Date;
  metadata?: {
    paystackData?: any;
    [key: string]: any;
  };
  failureReason?: string;
  refundedAt?: Date;
  refundReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateApplicationFeeData {
  userId: string;
  email: string;
  metadata?: Record<string, any>;
}

export interface ApplicationFeePaymentResponse {
  applicationFee: IApplicationFee;
  paymentUrl: string;
}

