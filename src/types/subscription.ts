import { Document } from 'mongoose';

export enum PaymentPlanType {
  EARLY_BIRD = 'early_bird',
  MID = 'mid',
  NORMAL = 'normal'
}

export enum SubscriptionStatus {
  ACTIVE = 'active',
  PENDING = 'pending',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
  SUSPENDED = 'suspended'
}

export enum TransactionStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

export enum PaymentMethod {
  CARD = 'card',
  BANK = 'bank',
  USSD = 'ussd',
  MOBILE_MONEY = 'mobile_money'
}

export interface IPaymentPlan extends Document {
  name: string;
  type: PaymentPlanType;
  description: string;
  totalAmount: number; // Total program cost
  installmentAmount: number; // Amount per payment
  numberOfInstallments: number; // Number of payments required
  semestersPerInstallment: number; // Semesters covered per payment
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISubscription extends Document {
  userId: string;
  planId: string;
  status: SubscriptionStatus;
  startDate: Date;
  endDate: Date;
  currentSemester: number; // Current semester (1-4)
  totalAmountPaid: number;
  amountRemaining: number;
  nextPaymentDue?: Date;
  nextPaymentAmount?: number;
  autoRenew: boolean;
  lastPaymentDate?: Date;
  cancelledAt?: Date;
  cancellationReason?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITransaction extends Document {
  userId: string;
  subscriptionId?: string;
  planId?: string;
  amount: number;
  currency: string;
  status: TransactionStatus;
  paymentMethod?: PaymentMethod;
  paystackReference: string;
  paystackAccessCode?: string;
  paystackAuthorizationUrl?: string;
  paymentDate?: Date;
  metadata?: {
    paystackData?: any;
    semestersPaid?: number;
    installmentNumber?: number;
    paymentType?: string; // Add paymentType to metadata
    [key: string]: any;
  };
  failureReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSubscriptionData {
  userId: string;
  planType: PaymentPlanType;
  metadata?: Record<string, any>;
}

export interface InitiatePaymentData {
  userId: string;
  subscriptionId?: string;
  planType: PaymentPlanType;
  email: string;
  amount: number;
  metadata?: Record<string, any>;
}

export interface PaystackInitializeResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

export interface PaystackVerifyResponse {
  status: boolean;
  message: string;
  data: {
    id: number;
    domain: string;
    status: string;
    reference: string;
    amount: number;
    message: string | null;
    gateway_response: string;
    paid_at: string;
    created_at: string;
    channel: string;
    currency: string;
    ip_address: string;
    metadata: any;
    log: any;
    fees: number;
    fees_split: any;
    authorization: {
      authorization_code: string;
      bin: string;
      last4: string;
      exp_month: string;
      exp_year: string;
      channel: string;
      card_type: string;
      bank: string;
      country_code: string;
      brand: string;
      reusable: boolean;
      signature: string;
      account_name: string | null;
    };
    customer: {
      id: number;
      first_name: string | null;
      last_name: string | null;
      email: string;
      customer_code: string;
      phone: string | null;
      metadata: any;
      risk_action: string;
    };
    plan: any;
    split: any;
    order_id: any;
    paidAt: string;
    createdAt: string;
    requested_amount: number;
    pos_transaction_data: any;
    source: any;
    fees_breakdown: any;
  };
}

export interface SubscriptionQueryParams {
  userId?: string;
  status?: SubscriptionStatus;
  planType?: PaymentPlanType;
  page?: number;
  limit?: number;
}

export interface PaymentStats {
  totalRevenue: number;
  totalSubscriptions: number;
  activeSubscriptions: number;
  pendingPayments: number;
  earlyBirdSubscriptions: number;
  midSubscriptions: number;
  normalSubscriptions: number;
}

