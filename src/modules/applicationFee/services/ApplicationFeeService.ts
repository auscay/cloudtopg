import { ApplicationFeeRepository } from '../repositories/ApplicationFeeRepository';
import { PaystackService } from '../../subscription/services/PaystackService';
import { User } from '../../user/models/User';
import {
  IApplicationFee,
  ApplicationFeeStatus,
  CreateApplicationFeeData,
  ApplicationFeePaymentResponse
} from '../../../types';

export class ApplicationFeeService {
  private applicationFeeRepo: ApplicationFeeRepository;
  private paystackService: PaystackService;
  private readonly APPLICATION_FEE_AMOUNT = 20000; // ₦20,000

  constructor() {
    this.applicationFeeRepo = new ApplicationFeeRepository();
    this.paystackService = new PaystackService();
  }

  /**
   * Initiate application fee payment
   */
  async initiatePayment(data: CreateApplicationFeeData): Promise<ApplicationFeePaymentResponse> {
    // Check if user has already paid
    const existingPayment = await this.applicationFeeRepo.findByUserId(data.userId);
    
    if (existingPayment && existingPayment.status === ApplicationFeeStatus.PAID) {
      throw new Error('Application fee has already been paid');
    }

    // If there's a pending payment, return it
    // if (existingPayment && existingPayment.status === ApplicationFeeStatus.PENDING) {
    //   return {
    //     applicationFee: existingPayment,
    //     paymentUrl: existingPayment.paystackAuthorizationUrl || ''
    //   };
    // }

    // Generate unique reference
    const reference = this.paystackService.generateReference().replace('SUB', 'APP');

    // Initialize Paystack transaction
    const paystackResponse = await this.paystackService.initializeTransaction(
      data.email,
      this.APPLICATION_FEE_AMOUNT,
      reference,
      {
        userId: data.userId,
        paymentType: 'application_fee',
        ...data.metadata
      }
    );

    if (!paystackResponse.status) {
      throw new Error('Failed to initialize payment');
    }

    // Create application fee record
    const applicationFee = await this.applicationFeeRepo.create({
      userId: data.userId,
      amount: this.APPLICATION_FEE_AMOUNT,
      currency: 'NGN',
      status: ApplicationFeeStatus.PENDING,
      paystackReference: reference,
      paystackAccessCode: paystackResponse.data.access_code,
      paystackAuthorizationUrl: paystackResponse.data.authorization_url,
      metadata: {
        paystackData: paystackResponse.data,
        ...data.metadata
      }
    } as any);

    return {
      applicationFee,
      paymentUrl: paystackResponse.data.authorization_url
    };
  }

  /**
   * Verify application fee payment
   */
  async verifyPayment(reference: string): Promise<IApplicationFee> {
    // Get application fee
    const applicationFee = await this.applicationFeeRepo.findByReference(reference);
    if (!applicationFee) {
      throw new Error('Application fee record not found');
    }

    // Check if already processed
    if (applicationFee.status === ApplicationFeeStatus.PAID) {
      return applicationFee;
    }

    // Verify with Paystack
    const paystackResponse = await this.paystackService.verifyTransaction(reference);

    if (!paystackResponse.status) {
      throw new Error('Payment verification failed');
    }

    const paymentData = paystackResponse.data;

    // Check payment status
    if (paymentData.status !== 'success') {
      // Update as failed
      const updatedFee = await this.applicationFeeRepo.updatePaymentStatus(
        reference,
        ApplicationFeeStatus.FAILED,
        undefined,
        { paystackData: paymentData },
        paymentData.gateway_response
      );

      if (!updatedFee) {
        throw new Error('Failed to update application fee');
      }

      throw new Error(`Payment failed: ${paymentData.gateway_response}`);
    }

    // Update as paid
    const updatedFee = await this.applicationFeeRepo.updatePaymentStatus(
      reference,
      ApplicationFeeStatus.PAID,
      new Date(paymentData.paid_at),
      {
        paystackData: paymentData,
        paymentMethod: paymentData.channel
      }
    );

    if (!updatedFee) {
      throw new Error('Failed to update application fee');
    }

    // Update user's application fee payment status
    await User.findByIdAndUpdate(
      applicationFee.userId,
      { applicationFeePaid: true }
    );

    return updatedFee;
  }

  /**
   * Check if user has paid application fee
   */
  async hasUserPaid(userId: string): Promise<boolean> {
    return this.applicationFeeRepo.hasUserPaid(userId);
  }

  /**
   * Get user's application fee payment
   */
  async getUserApplicationFee(userId: string): Promise<IApplicationFee | null> {
    return this.applicationFeeRepo.findByUserId(userId);
  }

  /**
   * Get application fee by reference
   */
  async getByReference(reference: string): Promise<IApplicationFee | null> {
    return this.applicationFeeRepo.findByReference(reference);
  }

  /**
   * Get application fee statistics (Admin)
   */
  async getStatistics() {
    const totalRevenue = await this.applicationFeeRepo.getTotalRevenue();
    const totalPaid = await this.applicationFeeRepo.countPaidApplications();
    const allPayments = await this.applicationFeeRepo.findAll();
    const pending = allPayments.filter((p: IApplicationFee) => p.status === ApplicationFeeStatus.PENDING).length;
    const failed = allPayments.filter((p: IApplicationFee) => p.status === ApplicationFeeStatus.FAILED).length;

    return {
      totalRevenue,
      totalApplications: allPayments.length,
      paidApplications: totalPaid,
      pendingPayments: pending,
      failedPayments: failed,
      applicationFeeAmount: this.APPLICATION_FEE_AMOUNT
    };
  }
}

// Export singleton instance
export const applicationFeeService = new ApplicationFeeService();

