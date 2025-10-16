import { Request, Response } from 'express';
import crypto from 'crypto';
import { SubscriptionService } from '../services/SubscriptionService';
import { ApplicationFeeService } from '../../applicationFee/services/ApplicationFeeService';
import { ApiResponse } from '../../../types';
import { config } from '../../../config';

export class WebhookController {
  private subscriptionService: SubscriptionService;
  private applicationFeeService: ApplicationFeeService;

  constructor() {
    this.subscriptionService = new SubscriptionService();
    this.applicationFeeService = new ApplicationFeeService();
  }

  /**
   * Handle Paystack webhook events
   */
  public handlePaystackWebhook = async (req: Request, res: Response): Promise<void> => {
    try {
      // Parse body if it's a buffer (from express.raw)
      let body: any;
      let bodyString: string;

      if (Buffer.isBuffer(req.body)) {
        bodyString = req.body.toString('utf8');
        body = JSON.parse(bodyString);
      } else {
        body = req.body;
        bodyString = JSON.stringify(req.body);
      }

      // Verify webhook signature
      const hash = crypto
        .createHmac('sha512', config.paystack.secretKey)
        .update(bodyString)
        .digest('hex');

      const signature = req.headers['x-paystack-signature'];

      if (hash !== signature) {
        console.error('Invalid webhook signature');
        res.status(400).send('Invalid signature');
        return;
      }

      // Get webhook event
      const event = body;
      console.log('Paystack webhook event:', event.event);

      // Handle different event types
      switch (event.event) {
        case 'charge.success':
          await this.handleChargeSuccess(event);
          break;

        case 'charge.failed':
          await this.handleChargeFailed(event);
          break;

        case 'transfer.success':
          console.log('Transfer success event:', event.data.reference);
          break;

        case 'transfer.failed':
          console.log('Transfer failed event:', event.data.reference);
          break;

        default:
          console.log('Unhandled webhook event:', event.event);
      }

      // Always return 200 to acknowledge receipt
      res.status(200).send('Webhook received');
    } catch (error) {
      console.error('Webhook processing error:', error);
      // Still return 200 to prevent Paystack from retrying
      res.status(200).send('Webhook received');
    }
  };

  /**
   * Handle successful charge event
   */
  private async handleChargeSuccess(event: any): Promise<void> {
    try {
      const { reference, amount, customer, metadata } = event.data;

      console.log('Processing successful charge:', {
        reference,
        amount,
        email: customer?.email,
        metadata
      });

      // Check if this is an application fee payment or subscription payment
      const paymentType = metadata?.paymentType || 'subscription';

      if (paymentType === 'application_fee' || reference.startsWith('APP-')) {
        // Handle application fee payment
        const applicationFee = await this.applicationFeeService.verifyPayment(reference);

        console.log('Application fee payment verified:', {
          reference,
          userId: applicationFee.userId,
          status: applicationFee.status,
          amount: applicationFee.amount
        });

        // Optional: Send notification email
        // await emailService.sendApplicationFeeConfirmation(customer.email, applicationFee);

      } else {
        // Handle subscription payment
        const result = await this.subscriptionService.verifyPayment(reference);

        console.log('Subscription payment verification result:', {
          reference,
          subscriptionId: result.subscription._id,
          status: result.subscription.status,
          currentSemester: result.subscription.currentSemester,
          amountPaid: result.subscription.totalAmountPaid
        });

        // Optional: Send notification email
        // await emailService.sendPaymentConfirmation(customer.email, result);
      }

    } catch (error) {
      console.error('Error handling charge.success:', error);
      // Don't throw - we don't want to return error to Paystack
    }
  }

  /**
   * Handle failed charge event
   */
  private async handleChargeFailed(event: any): Promise<void> {
    try {
      const { reference, customer, gateway_response } = event.data;

      console.log('Processing failed charge:', {
        reference,
        email: customer?.email,
        reason: gateway_response
      });

      // Optional: Update transaction status or notify user
      // await emailService.sendPaymentFailureNotification(customer.email, gateway_response);

    } catch (error) {
      console.error('Error handling charge.failed:', error);
    }
  }

  /**
   * Test webhook endpoint (for development/testing)
   */
  public testWebhook = async (req: Request, res: Response): Promise<void> => {
    try {
      const response: ApiResponse = {
        success: true,
        message: 'Webhook endpoint is working',
        data: {
          receivedBody: req.body,
          headers: req.headers,
          timestamp: new Date().toISOString()
        }
      };

      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        message: 'Webhook test failed',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
      res.status(500).json(response);
    }
  };
}

