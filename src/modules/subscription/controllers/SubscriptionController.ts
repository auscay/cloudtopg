import { Response } from 'express';
import { SubscriptionService } from '../services/SubscriptionService';
import { AuthenticatedRequest, ApiResponse, PaymentPlanType } from '../../../types';

export class SubscriptionController {
  private subscriptionService: SubscriptionService;

  constructor() {
    this.subscriptionService = new SubscriptionService();
  }

  /**
   * Get all payment plans
   */
  public getPlans = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const plans = await this.subscriptionService.getPaymentPlans();

      const response: ApiResponse = {
        success: true,
        message: 'Payment plans retrieved successfully',
        data: plans
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Get plans error:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to retrieve payment plans',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
      res.status(500).json(response);
    }
  };

  /**
   * Get payment plan by type
   */
  public getPlanByType = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { type } = req.params;

      const plan = await this.subscriptionService.getPaymentPlanByType(type as PaymentPlanType);

      if (!plan) {
        const response: ApiResponse = {
          success: false,
          message: 'Payment plan not found'
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse = {
        success: true,
        message: 'Payment plan retrieved successfully',
        data: plan
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Get plan by type error:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to retrieve payment plan',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
      res.status(500).json(response);
    }
  };

  /**
   * Create subscription and initiate payment
   */
  public createSubscription = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { planType, metadata } = req.body;
      const userId = req.user!._id.toString();
      const userEmail = req.user!.email;

      // Get payment plan
      const plan = await this.subscriptionService.getPaymentPlanByType(planType);
      if (!plan) {
        const response: ApiResponse = {
          success: false,
          message: 'Payment plan not found'
        };
        res.status(404).json(response);
        return;
      }

      // Initiate payment
      const result = await this.subscriptionService.initiatePayment({
        userId,
        planType,
        email: userEmail,
        amount: plan.installmentAmount,
        metadata
      });

      const response: ApiResponse = {
        success: true,
        message: 'Subscription created and payment initiated successfully',
        data: {
          subscription: result.subscription,
          transaction: result.transaction,
          paymentUrl: result.paymentUrl
        }
      };

      res.status(201).json(response);
    } catch (error) {
      console.error('Create subscription error:', error);
      const response: ApiResponse = {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create subscription',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
      res.status(400).json(response);
    }
  };

  /**
   * Make payment for existing subscription
   */
  public makePayment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { subscriptionId } = req.params;
      const userId = req.user!._id.toString();
      const userEmail = req.user!.email;

      if (!subscriptionId) {
        const response: ApiResponse = {
          success: false,
          message: 'Subscription ID is required'
        };
        res.status(400).json(response);
        return;
      }

      // Get subscription
      const subscription = await this.subscriptionService.getSubscriptionById(subscriptionId);
      if (!subscription) {
        const response: ApiResponse = {
          success: false,
          message: 'Subscription not found'
        };
        res.status(404).json(response);
        return;
      }

      // Verify ownership
      if (subscription.userId !== userId) {
        const response: ApiResponse = {
          success: false,
          message: 'Unauthorized access to subscription'
        };
        res.status(403).json(response);
        return;
      }

      // Check if payment is needed
      if (subscription.amountRemaining === 0) {
        const response: ApiResponse = {
          success: false,
          message: 'Subscription is fully paid'
        };
        res.status(400).json(response);
        return;
      }

      // Get payment plan
      const plan = await this.subscriptionService.getPaymentPlanByType(
        req.body.planType || PaymentPlanType.EARLY_BIRD
      );
      if (!plan) {
        const response: ApiResponse = {
          success: false,
          message: 'Payment plan not found'
        };
        res.status(404).json(response);
        return;
      }

      // Initiate payment
      const result = await this.subscriptionService.initiatePayment({
        userId,
        subscriptionId,
        planType: plan.type,
        email: userEmail,
        amount: subscription.nextPaymentAmount || plan.installmentAmount,
        metadata: req.body.metadata
      });

      const response: ApiResponse = {
        success: true,
        message: 'Payment initiated successfully',
        data: {
          transaction: result.transaction,
          paymentUrl: result.paymentUrl
        }
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Make payment error:', error);
      const response: ApiResponse = {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to initiate payment',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
      res.status(400).json(response);
    }
  };

  /**
   * Verify payment
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

      const result = await this.subscriptionService.verifyPayment(reference);

      const response: ApiResponse = {
        success: true,
        message: 'Payment verified successfully',
        data: {
          transaction: result.transaction,
          subscription: result.subscription
        }
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Verify payment error:', error);
      const response: ApiResponse = {
        success: false,
        message: error instanceof Error ? error.message : 'Payment verification failed',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
      res.status(400).json(response);
    }
  };

  /**
   * Get user's subscriptions
   */
  public getUserSubscriptions = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!._id.toString();

      const subscriptions = await this.subscriptionService.getUserSubscriptions(userId);

      const response: ApiResponse = {
        success: true,
        message: 'Subscriptions retrieved successfully',
        data: subscriptions
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Get user subscriptions error:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to retrieve subscriptions',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
      res.status(500).json(response);
    }
  };

  /**
   * Get user's active subscription
   */
  public getActiveSubscription = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!._id.toString();

      const subscription = await this.subscriptionService.getUserActiveSubscription(userId);

      if (!subscription) {
        const response: ApiResponse = {
          success: false,
          message: 'No active subscription found'
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse = {
        success: true,
        message: 'Active subscription retrieved successfully',
        data: subscription
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Get active subscription error:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to retrieve active subscription',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
      res.status(500).json(response);
    }
  };

  /**
   * Get subscription by ID
   */
  public getSubscriptionById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user!._id.toString();

      if (!id) {
        const response: ApiResponse = {
          success: false,
          message: 'Subscription ID is required'
        };
        res.status(400).json(response);
        return;
      }

      const subscription = await this.subscriptionService.getSubscriptionById(id);

      if (!subscription) {
        const response: ApiResponse = {
          success: false,
          message: 'Subscription not found'
        };
        res.status(404).json(response);
        return;
      }

      // Verify ownership
      if (subscription.userId !== userId) {
        const response: ApiResponse = {
          success: false,
          message: 'Unauthorized access to subscription'
        };
        res.status(403).json(response);
        return;
      }

      const response: ApiResponse = {
        success: true,
        message: 'Subscription retrieved successfully',
        data: subscription
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Get subscription by ID error:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to retrieve subscription',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
      res.status(500).json(response);
    }
  };

  /**
   * Get user's transactions
   */
  public getUserTransactions = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!._id.toString();

      const transactions = await this.subscriptionService.getUserTransactions(userId);

      const response: ApiResponse = {
        success: true,
        message: 'Transactions retrieved successfully',
        data: transactions
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Get user transactions error:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to retrieve transactions',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
      res.status(500).json(response);
    }
  };

  /**
   * Get subscription transactions
   */
  public getSubscriptionTransactions = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { subscriptionId } = req.params;
      const userId = req.user!._id.toString();

      if (!subscriptionId) {
        const response: ApiResponse = {
          success: false,
          message: 'Subscription ID is required'
        };
        res.status(400).json(response);
        return;
      }

      // Verify subscription ownership
      const subscription = await this.subscriptionService.getSubscriptionById(subscriptionId);
      if (!subscription) {
        const response: ApiResponse = {
          success: false,
          message: 'Subscription not found'
        };
        res.status(404).json(response);
        return;
      }

      if (subscription.userId !== userId) {
        const response: ApiResponse = {
          success: false,
          message: 'Unauthorized access to subscription'
        };
        res.status(403).json(response);
        return;
      }

      const transactions = await this.subscriptionService.getSubscriptionTransactions(subscriptionId!);

      const response: ApiResponse = {
        success: true,
        message: 'Subscription transactions retrieved successfully',
        data: transactions
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Get subscription transactions error:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to retrieve subscription transactions',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
      res.status(500).json(response);
    }
  };

  /**
   * Cancel subscription
   */
  public cancelSubscription = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const userId = req.user!._id.toString();

      if (!id) {
        const response: ApiResponse = {
          success: false,
          message: 'Subscription ID is required'
        };
        res.status(400).json(response);
        return;
      }

      // Verify ownership
      const subscription = await this.subscriptionService.getSubscriptionById(id);
      if (!subscription) {
        const response: ApiResponse = {
          success: false,
          message: 'Subscription not found'
        };
        res.status(404).json(response);
        return;
      }

      if (subscription.userId !== userId) {
        const response: ApiResponse = {
          success: false,
          message: 'Unauthorized access to subscription'
        };
        res.status(403).json(response);
        return;
      }

      const cancelledSubscription = await this.subscriptionService.cancelSubscription(id!, reason);

      const response: ApiResponse = {
        success: true,
        message: 'Subscription cancelled successfully',
        data: cancelledSubscription
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Cancel subscription error:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to cancel subscription',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
      res.status(500).json(response);
    }
  };

  /**
   * Check user access (to protected resources)
   */
  public checkAccess = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!._id.toString();

      const accessInfo = await this.subscriptionService.checkUserAccess(userId);

      const response: ApiResponse = {
        success: accessInfo.hasAccess,
        message: accessInfo.message,
        data: accessInfo.subscription
      };

      res.status(accessInfo.hasAccess ? 200 : 403).json(response);
    } catch (error) {
      console.error('Check access error:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to check access',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
      res.status(500).json(response);
    }
  };

  /**
   * Get payment statistics (Admin only)
   */
  public getPaymentStats = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const stats = await this.subscriptionService.getPaymentStats();

      const response: ApiResponse = {
        success: true,
        message: 'Payment statistics retrieved successfully',
        data: stats
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Get payment stats error:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to retrieve payment statistics',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
      res.status(500).json(response);
    }
  };
}

