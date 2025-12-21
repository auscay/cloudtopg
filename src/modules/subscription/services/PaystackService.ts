import axios, { AxiosInstance } from 'axios';
import { config } from '../../../config';
import { PaystackInitializeResponse, PaystackVerifyResponse } from '../../../types';

export class PaystackService {
  private api: AxiosInstance;
  private secretKey: string;

  constructor() {
    this.secretKey = config.paystack.secretKey;
    
    this.api = axios.create({
      baseURL: 'https://api.paystack.co',
      headers: {
        'Authorization': `Bearer ${this.secretKey}`,
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * Initialize a payment transaction
   */
  async initializeTransaction(
    email: string,
    amount: number,
    reference: string,
    metadata?: Record<string, any>,
    currency: string = 'NGN'
  ): Promise<PaystackInitializeResponse> {
    try {
      // Paystack expects amount in kobo (smallest currency unit)
      const amountInKobo = Math.round(amount * 100);

      const response = await this.api.post('/transaction/initialize', {
        email,
        amount: amountInKobo,
        reference,
        currency,
        callback_url: config.paystack.callbackUrl,
        metadata: {
          ...metadata,
          cancel_action: `${config.app.url}/student`
        }
      });

      return response.data;
    } catch (error: any) {
      console.error('Paystack initialization error:', error.response?.data || error.message);
      throw new Error(
        error.response?.data?.message || 'Failed to initialize payment'
      );
    }
  }

  /**
   * Verify a payment transaction
   */
  async verifyTransaction(reference: string): Promise<PaystackVerifyResponse> {
    try {
      const response = await this.api.get(`/transaction/verify/${reference}`);
      return response.data;
    } catch (error: any) {
      console.error('Paystack verification error:', error.response?.data || error.message);
      throw new Error(
        error.response?.data?.message || 'Failed to verify payment'
      );
    }
  }

  /**
   * Get transaction details
   */
  async getTransaction(reference: string): Promise<PaystackVerifyResponse> {
    try {
      const response = await this.api.get(`/transaction/verify/${reference}`);
      return response.data;
    } catch (error: any) {
      console.error('Paystack get transaction error:', error.response?.data || error.message);
      throw new Error(
        error.response?.data?.message || 'Failed to get transaction details'
      );
    }
  }

  /**
   * List transactions
   */
  async listTransactions(perPage: number = 50, page: number = 1): Promise<any> {
    try {
      const response = await this.api.get('/transaction', {
        params: {
          perPage,
          page
        }
      });
      return response.data;
    } catch (error: any) {
      console.error('Paystack list transactions error:', error.response?.data || error.message);
      throw new Error(
        error.response?.data?.message || 'Failed to list transactions'
      );
    }
  }

  /**
   * Generate a unique transaction reference
   */
  generateReference(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000000);
    return `SUB-${timestamp}-${random}`;
  }

  /**
   * Convert kobo to naira
   */
  koboToNaira(kobo: number): number {
    return kobo / 100;
  }

  /**
   * Convert naira to kobo
   */
  nairaToKobo(naira: number): number {
    return Math.round(naira * 100);
  }
}

// Export singleton instance
export const paystackService = new PaystackService();

