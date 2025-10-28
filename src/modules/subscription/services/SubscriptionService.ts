import { SubscriptionRepository } from '../repositories/SubscriptionRepository';
import { TransactionRepository } from '../repositories/TransactionRepository';
import { PaymentPlanRepository } from '../repositories/PaymentPlanRepository';
import { PaystackService } from './PaystackService';
import { User } from '../../user/models/User';
import {
  ISubscription,
  ITransaction,
  IPaymentPlan,
  PaymentPlanType,
  SubscriptionStatus,
  TransactionStatus,
  CreateSubscriptionData,
  InitiatePaymentData,
  PaymentStats
} from '../../../types';

export class SubscriptionService {
  private subscriptionRepo: SubscriptionRepository;
  private transactionRepo: TransactionRepository;
  private planRepo: PaymentPlanRepository;
  private paystackService: PaystackService;

  constructor() {
    this.subscriptionRepo = new SubscriptionRepository();
    this.transactionRepo = new TransactionRepository();
    this.planRepo = new PaymentPlanRepository();
    this.paystackService = new PaystackService();
  }

  /**
   * Create a new subscription
   */
  async createSubscription(data: CreateSubscriptionData): Promise<ISubscription> {
    try {
      // Check if user already has an active subscription
      const existingActiveSubscription = await this.subscriptionRepo.findActiveByUserId(data.userId);
      if (existingActiveSubscription) {
        throw new Error('User already has an active subscription');
      }

      // Check if user has any pending subscriptions
      const allUserSubscriptions = await this.subscriptionRepo.findByUserId(data.userId);
      const pendingSubscription = allUserSubscriptions.find(
        sub => sub.status === SubscriptionStatus.PENDING && sub.amountRemaining > 0
      );
      
      // If a pending subscription exists, return it instead of creating a new one
      if (pendingSubscription) {
        return pendingSubscription;
      }

      // Get the payment plan
      const plan = await this.planRepo.findByType(data.planType);
      if (!plan) {
        throw new Error('Payment plan not found');
      }

      // Calculate subscription dates (4 semesters = 12 months)
      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 12);

      // Determine next payment details
      let nextPaymentDue: Date | undefined;
      let nextPaymentAmount: number | undefined;

      if (plan.numberOfInstallments > 1) {
        // For installment plans, set next payment due date
        nextPaymentDue = new Date(startDate);
        nextPaymentDue.setDate(nextPaymentDue.getDate() + 7); // 7 days grace period
        nextPaymentAmount = plan.installmentAmount;
      }

      // Create subscription
      const subscription = await this.subscriptionRepo.create({
        userId: data.userId,
        planId: (plan._id as any).toString(),
        status: SubscriptionStatus.PENDING,
        startDate,
        endDate,
        currentSemester: 0,
        totalAmountPaid: 0,
        amountRemaining: plan.totalAmount,
        nextPaymentDue,
        nextPaymentAmount,
        autoRenew: false,
        metadata: data.metadata
      } as any);

      return subscription;
    } catch (error) {
      throw new Error(`Failed to create subscription: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Initiate payment for a subscription
   */
  async initiatePayment(data: InitiatePaymentData): Promise<{
    subscription: ISubscription;
    transaction: ITransaction;
    paymentUrl: string;
  }> {
    try {
      let subscription: ISubscription;

      // Get or create subscription
      if (data.subscriptionId) {
        const existingSub = await this.subscriptionRepo.findById(data.subscriptionId);
        if (!existingSub) {
          throw new Error('Subscription not found');
        }
        subscription = existingSub;
      } else {
        subscription = await this.createSubscription({
          userId: data.userId,
          planType: data.planType,
          metadata: data.metadata || {}
        });
      }

      // Get payment plan
      const plan = await this.planRepo.findById(subscription.planId);
      if (!plan) {
        throw new Error('Payment plan not found');
      }

      // // Validate payment amount
      // if (data.amount !== plan.installmentAmount) {
      //   throw new Error('Invalid payment amount');
      // }

      // Generate unique reference
      const reference = this.paystackService.generateReference();

      // Initialize Paystack transaction
      const paystackResponse = await this.paystackService.initializeTransaction(
        data.email,
        plan.installmentAmount,
        reference,
        {
          subscriptionId: (subscription._id as any).toString(),
          planType: plan.type,
          userId: data.userId,
          ...data.metadata
        }
      );

      if (!paystackResponse.status) {
        throw new Error('Failed to initialize payment');
      }

      // Create transaction record
      const transaction = await this.transactionRepo.create({
        userId: data.userId,
        subscriptionId: (subscription._id as any).toString(),
        planId: (plan._id as any).toString(),
        amount: plan.installmentAmount,
        currency: 'NGN',
        status: TransactionStatus.PENDING,
        paystackReference: reference,
        paystackAccessCode: paystackResponse.data.access_code,
        paystackAuthorizationUrl: paystackResponse.data.authorization_url,
        metadata: {
          paystackData: paystackResponse.data,
          ...data.metadata
        }
      } as any);

      return {
        subscription,
        transaction,
        paymentUrl: paystackResponse.data.authorization_url
      };
    } catch (error) {
      throw new Error(`Failed to initiate payment: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Verify and process payment
   */
  async verifyPayment(reference: string): Promise<{
    transaction: ITransaction;
    subscription: ISubscription;
  }> {
    try {
      // Get transaction
      const transaction = await this.transactionRepo.findByReference(reference);
      if (!transaction) {
        throw new Error('Transaction not found');
      }

      // Check if already processed
      if (transaction.status === TransactionStatus.SUCCESS) {
        if (!transaction.subscriptionId) {
          throw new Error('Transaction does not have a subscription ID');
        }
        const subscription = await this.subscriptionRepo.findById(transaction.subscriptionId);
        if (!subscription) {
          throw new Error('Subscription not found');
        }
        return { transaction, subscription };
      }

      // Verify with Paystack
      const paystackResponse = await this.paystackService.verifyTransaction(reference);

      if (!paystackResponse.status) {
        throw new Error('Payment verification failed');
      }

      const paymentData = paystackResponse.data;

      // Check payment status
      if (paymentData.status !== 'success') {
        // Update transaction as failed
        await this.transactionRepo.updateTransactionStatus(
          reference,
          TransactionStatus.FAILED,
          undefined,
          { paystackData: paymentData },
          paymentData.gateway_response
        );
        throw new Error(`Payment failed: ${paymentData.gateway_response}`);
      }

      // Get subscription and plan
      if (!transaction.subscriptionId) {
        throw new Error('Transaction does not have a subscription ID');
      }
      const subscriptionId = transaction.subscriptionId; // Type narrowing
      const subscription = await this.subscriptionRepo.findById(subscriptionId);
      if (!subscription) {
        throw new Error('Subscription not found');
      }

      const plan = await this.planRepo.findById(subscription.planId);
      if (!plan) {
        throw new Error('Payment plan not found');
      }

      // Update transaction as successful
      const updatedTransaction = await this.transactionRepo.updateTransactionStatus(
        reference,
        TransactionStatus.SUCCESS,
        new Date(paymentData.paid_at),
        {
          paystackData: paymentData,
          semestersPaid: plan.semestersPerInstallment,
          installmentNumber: Math.floor(subscription.totalAmountPaid / plan.installmentAmount) + 1
        }
      );

      // Update subscription
      const newTotalPaid = subscription.totalAmountPaid + transaction.amount;
      const newAmountRemaining = plan.totalAmount - newTotalPaid;
      const newCurrentSemester = Math.min(
        subscription.currentSemester + plan.semestersPerInstallment,
        4
      );

      // Determine next payment details
      let nextPaymentDue: Date | undefined;
      let nextPaymentAmount: number | undefined;

      if (newAmountRemaining > 0) {
        // Calculate next payment due date based on plan type
        nextPaymentDue = new Date();
        
        if (plan.type === PaymentPlanType.EARLY_BIRD) {
          // Early bird pays per semester (every 3 months)
          nextPaymentDue.setMonth(nextPaymentDue.getMonth() + 3);
        } else if (plan.type === PaymentPlanType.MID) {
          // Mid pays every 2 semesters (every 6 months)
          nextPaymentDue.setMonth(nextPaymentDue.getMonth() + 6);
        }
        // Normal plan pays upfront, so no next payment

        nextPaymentAmount = plan.installmentAmount;
      }

      const updatedSubscription = await this.subscriptionRepo.updatePaymentInfo(
        (subscription._id as any).toString(),
        newTotalPaid,
        newAmountRemaining,
        newCurrentSemester,
        nextPaymentDue,
        nextPaymentAmount
      );

      if (!updatedSubscription || !updatedTransaction) {
        throw new Error('Failed to update subscription');
      }

      // Update user's subscription reference if subscription is now active
      if (updatedSubscription.status === SubscriptionStatus.ACTIVE) {
        await User.findByIdAndUpdate(
          updatedSubscription.userId,
          { subscription: updatedSubscription._id }
        );
      }

      return {
        transaction: updatedTransaction,
        subscription: updatedSubscription
      };
    } catch (error) {
      throw new Error(`Failed to verify payment: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get user's subscriptions
   */
  async getUserSubscriptions(userId: string): Promise<ISubscription[]> {
    try {
      return await this.subscriptionRepo.findByUserId(userId);
    } catch (error) {
      throw new Error(`Failed to get user subscriptions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get user's active subscription
   */
  async getUserActiveSubscription(userId: string): Promise<ISubscription | null> {
    try {
      return await this.subscriptionRepo.findActiveByUserId(userId);
    } catch (error) {
      throw new Error(`Failed to get user active subscription: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get subscription by ID
   */
  async getSubscriptionById(id: string): Promise<ISubscription | null> {
    try {
      return await this.subscriptionRepo.findById(id);
    } catch (error) {
      throw new Error(`Failed to get subscription by ID: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get user's transactions
   */
  async getUserTransactions(userId: string): Promise<ITransaction[]> {
    try {
      return await this.transactionRepo.findByUserId(userId);
    } catch (error) {
      throw new Error(`Failed to get user transactions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get subscription transactions
   */
  async getSubscriptionTransactions(subscriptionId: string): Promise<ITransaction[]> {
    try {
      return await this.transactionRepo.findBySubscriptionId(subscriptionId);
    } catch (error) {
      throw new Error(`Failed to get subscription transactions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(id: string, reason?: string): Promise<ISubscription | null> {
    try {
      const subscription = await this.subscriptionRepo.cancelSubscription(id, reason);
      
      // Remove subscription reference from user
      if (subscription) {
        await User.findByIdAndUpdate(
          subscription.userId,
          { subscription: null }
        );
      }
      
      return subscription;
    } catch (error) {
      throw new Error(`Failed to cancel subscription: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get all payment plans
   */
  async getPaymentPlans(): Promise<IPaymentPlan[]> {
    try {
      return await this.planRepo.findActivePlans();
    } catch (error) {
      throw new Error(`Failed to get payment plans: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get payment plan by type
   */
  async getPaymentPlanByType(type: PaymentPlanType): Promise<IPaymentPlan | null> {
    try {
      return await this.planRepo.findByType(type);
    } catch (error) {
      throw new Error(`Failed to get payment plan by type: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check if user has active access
   */
  async checkUserAccess(userId: string): Promise<{
    hasAccess: boolean;
    subscription?: ISubscription;
    message: string;
  }> {
    try {
      const subscription = await this.subscriptionRepo.findActiveByUserId(userId);

      if (!subscription) {
        return {
          hasAccess: false,
          message: 'No active subscription found'
        };
      }

      if (subscription.status !== SubscriptionStatus.ACTIVE) {
        return {
          hasAccess: false,
          subscription,
          message: 'Subscription is not active'
        };
      }

      if (subscription.endDate < new Date()) {
        return {
          hasAccess: false,
          subscription,
          message: 'Subscription has expired'
        };
      }

      return {
        hasAccess: true,
        subscription,
        message: 'Access granted'
      };
    } catch (error) {
      throw new Error(`Failed to check user access: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get payment statistics (Admin)
   */
  async getPaymentStats(): Promise<PaymentStats> {
    try {
      const totalRevenue = await this.transactionRepo.getTotalRevenue();
      const subscriptionRevenue = await this.transactionRepo.getTotalSubscriptionRevenue();
      const applicationFeeRevenue = await this.transactionRepo.getTotalApplicationFee();
      const totalUsers = await this.transactionRepo.getTotalUsers();
      
      const allSubscriptions = await this.subscriptionRepo.findAll();
      const activeSubscriptions = await this.subscriptionRepo.findByStatus(SubscriptionStatus.ACTIVE);
      
      const earlyBirdPlan = await this.planRepo.findByType(PaymentPlanType.EARLY_BIRD);
      const midPlan = await this.planRepo.findByType(PaymentPlanType.MID);
      const normalPlan = await this.planRepo.findByType(PaymentPlanType.NORMAL);

      const earlyBirdSubs = earlyBirdPlan 
        ? allSubscriptions.filter((s: ISubscription) => s.planId === (earlyBirdPlan._id as any).toString()).length 
        : 0;
      const midSubs = midPlan 
        ? allSubscriptions.filter((s: ISubscription) => s.planId === (midPlan._id as any).toString()).length 
        : 0;
      const normalSubs = normalPlan 
        ? allSubscriptions.filter((s: ISubscription) => s.planId === (normalPlan._id as any).toString()).length 
        : 0;

      const pendingPayments = allSubscriptions.filter(
        (s: ISubscription) => s.status === SubscriptionStatus.ACTIVE && s.amountRemaining > 0
      ).length;

      return {
        totalRevenue,
        subscriptionRevenue,
        applicationFeeRevenue,
        totalSubscriptions: allSubscriptions.length,
        activeSubscriptions: activeSubscriptions.length,
        pendingPayments,
        earlyBirdSubscriptions: earlyBirdSubs,
        midSubscriptions: midSubs,
        normalSubscriptions: normalSubs,
        totalUsers
      };
    } catch (error) {
      throw new Error(`Failed to get payment stats: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Export singleton instance
export const subscriptionService = new SubscriptionService();

