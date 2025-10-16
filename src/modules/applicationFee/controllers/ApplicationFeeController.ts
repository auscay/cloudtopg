import { Response } from 'express';
import { ApplicationFeeService } from '../services/ApplicationFeeService';
import { AuthenticatedRequest, ApiResponse } from '../../../types';

export class ApplicationFeeController {
  private applicationFeeService: ApplicationFeeService;

  constructor() {
    this.applicationFeeService = new ApplicationFeeService();
  }

  /**
   * Initiate application fee payment
   */
  public initiatePayment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!._id.toString();
      const userEmail = req.user!.email;

      const result = await this.applicationFeeService.initiatePayment({
        userId,
        email: userEmail,
        metadata: req.body.metadata
      });

      const response: ApiResponse = {
        success: true,
        message: 'Application fee payment initiated successfully',
        data: {
          applicationFee: result.applicationFee,
          paymentUrl: result.paymentUrl
        }
      };

      res.status(201).json(response);
    } catch (error) {
      console.error('Initiate application fee payment error:', error);
      const response: ApiResponse = {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to initiate payment',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
      res.status(400).json(response);
    }
  };

  /**
   * Verify application fee payment
   */
  public verifyPayment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { reference } = req.query;

      if (!reference || typeof reference !== 'string') {
        const response: ApiResponse = {
          success: false,
          message: 'Payment reference is required'
        };
        res.status(400).json(response);
        return;
      }

      const applicationFee = await this.applicationFeeService.verifyPayment(reference);

      const response: ApiResponse = {
        success: true,
        message: 'Application fee payment verified successfully',
        data: applicationFee
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Verify application fee payment error:', error);
      const response: ApiResponse = {
        success: false,
        message: error instanceof Error ? error.message : 'Payment verification failed',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
      res.status(400).json(response);
    }
  };

  /**
   * Get user's application fee payment status
   */
  public getPaymentStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!._id.toString();

      const applicationFee = await this.applicationFeeService.getUserApplicationFee(userId);

      if (!applicationFee) {
        const response: ApiResponse = {
          success: true,
          message: 'No application fee payment found',
          data: {
            hasPaid: false,
            amount: 20000
          }
        };
        res.status(200).json(response);
        return;
      }

      const response: ApiResponse = {
        success: true,
        message: 'Application fee payment status retrieved successfully',
        data: {
          hasPaid: applicationFee.status === 'paid',
          applicationFee
        }
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Get application fee payment status error:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to retrieve payment status',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
      res.status(500).json(response);
    }
  };

  /**
   * Check if user has paid application fee
   */
  public checkPaymentStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!._id.toString();

      const hasPaid = await this.applicationFeeService.hasUserPaid(userId);

      const response: ApiResponse = {
        success: true,
        message: hasPaid ? 'Application fee has been paid' : 'Application fee not paid',
        data: {
          hasPaid,
          amount: 20000,
          currency: 'NGN'
        }
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Check application fee payment error:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to check payment status',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
      res.status(500).json(response);
    }
  };

  /**
   * Get application fee statistics (Admin only)
   */
  public getStatistics = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const stats = await this.applicationFeeService.getStatistics();

      const response: ApiResponse = {
        success: true,
        message: 'Application fee statistics retrieved successfully',
        data: stats
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Get application fee statistics error:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to retrieve statistics',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
      res.status(500).json(response);
    }
  };
}

