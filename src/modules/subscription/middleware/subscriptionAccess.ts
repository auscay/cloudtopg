import { Response, NextFunction } from 'express';
import { SubscriptionService } from '../services/SubscriptionService';
import { AuthenticatedRequest, ApiResponse } from '../../../types';

export class SubscriptionAccessMiddleware {
  private subscriptionService: SubscriptionService;

  constructor() {
    this.subscriptionService = new SubscriptionService();
  }

  /**
   * Middleware to check if user has active subscription access
   */
  public requireActiveSubscription = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        const response: ApiResponse = {
          success: false,
          message: 'Authentication required'
        };
        res.status(401).json(response);
        return;
      }

      const userId = req.user._id.toString();
      const accessInfo = await this.subscriptionService.checkUserAccess(userId);

      if (!accessInfo.hasAccess) {
        const response: ApiResponse = {
          success: false,
          message: accessInfo.message,
          data: {
            hasAccess: false,
            subscription: accessInfo.subscription
          }
        };
        res.status(403).json(response);
        return;
      }

      // Attach subscription to request for downstream use
      (req as any).subscription = accessInfo.subscription;
      next();
    } catch (error) {
      console.error('Subscription access check error:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to verify subscription access',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
      res.status(500).json(response);
    }
  };

  /**
   * Middleware to check if user has paid for specific semester
   */
  public requireSemesterAccess = (semesterNumber: number) => {
    return async (
      req: AuthenticatedRequest,
      res: Response,
      next: NextFunction
    ): Promise<void> => {
      try {
        if (!req.user) {
          const response: ApiResponse = {
            success: false,
            message: 'Authentication required'
          };
          res.status(401).json(response);
          return;
        }

        const userId = req.user._id.toString();
        const subscription = await this.subscriptionService.getUserActiveSubscription(userId);

        if (!subscription) {
          const response: ApiResponse = {
            success: false,
            message: 'No active subscription found'
          };
          res.status(403).json(response);
          return;
        }

        if (subscription.currentSemester < semesterNumber) {
          const response: ApiResponse = {
            success: false,
            message: `Access denied. Payment required for semester ${semesterNumber}`,
            data: {
              currentSemester: subscription.currentSemester,
              requiredSemester: semesterNumber,
              amountRemaining: subscription.amountRemaining
            }
          };
          res.status(403).json(response);
          return;
        }

        // Attach subscription to request
        (req as any).subscription = subscription;
        next();
      } catch (error) {
        console.error('Semester access check error:', error);
        const response: ApiResponse = {
          success: false,
          message: 'Failed to verify semester access',
          errors: [error instanceof Error ? error.message : 'Unknown error']
        };
        res.status(500).json(response);
      }
    };
  };
}

// Export singleton instance
export const subscriptionAccessMiddleware = new SubscriptionAccessMiddleware();

