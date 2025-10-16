import { Router } from 'express';
import { SubscriptionController } from '../controllers/SubscriptionController';
import { authMiddleware } from '../../auth/middleware/auth';
import { ErrorHandler } from '../../../middleware/errorHandler';
import { validateBody, validateQuery, validateParams } from '../../../middleware/validation';
import {
  createSubscriptionSchema,
  makePaymentSchema,
  makePaymentParamsSchema,
  verifyPaymentQuerySchema,
  subscriptionIdParamsSchema,
  subscriptionTransactionsParamsSchema,
  cancelSubscriptionSchema,
  planTypeParamsSchema
} from '../validators/subscriptionValidators';
import { UserRole } from '../../../types';

const router = Router();
const subscriptionController = new SubscriptionController();

// Public routes (require authentication only)

/**
 * @route   GET /api/subscriptions/plans
 * @desc    Get all available payment plans
 * @access  Private (authenticated users)
 */
router.get(
  '/plans',
  authMiddleware.authenticate,
  ErrorHandler.asyncHandler(subscriptionController.getPlans)
);

/**
 * @route   GET /api/subscriptions/plans/:type
 * @desc    Get payment plan by type
 * @access  Private (authenticated users)
 */
router.get(
  '/plans/:type',
  authMiddleware.authenticate,
  validateParams(planTypeParamsSchema),
  ErrorHandler.asyncHandler(subscriptionController.getPlanByType)
);

/**
 * @route   POST /api/subscriptions
 * @desc    Create a new subscription and initiate payment
 * @access  Private (authenticated users)
 */
router.post(
  '/',
  authMiddleware.authenticate,
  validateBody(createSubscriptionSchema),
  ErrorHandler.asyncHandler(subscriptionController.createSubscription)
);

/**
 * @route   GET /api/subscriptions/verify
 * @desc    Verify payment after Paystack redirect
 * @access  Private (authenticated users)
 */
router.get(
  '/verify',
  authMiddleware.authenticate,
  validateQuery(verifyPaymentQuerySchema),
  ErrorHandler.asyncHandler(subscriptionController.verifyPayment)
);

/**
 * @route   GET /api/subscriptions/my-subscriptions
 * @desc    Get current user's subscriptions
 * @access  Private (authenticated users)
 */
router.get(
  '/my-subscriptions',
  authMiddleware.authenticate,
  ErrorHandler.asyncHandler(subscriptionController.getUserSubscriptions)
);

/**
 * @route   GET /api/subscriptions/active
 * @desc    Get current user's active subscription
 * @access  Private (authenticated users)
 */
router.get(
  '/active',
  authMiddleware.authenticate,
  ErrorHandler.asyncHandler(subscriptionController.getActiveSubscription)
);

/**
 * @route   GET /api/subscriptions/check-access
 * @desc    Check if user has active subscription access
 * @access  Private (authenticated users)
 */
router.get(
  '/check-access',
  authMiddleware.authenticate,
  ErrorHandler.asyncHandler(subscriptionController.checkAccess)
);

/**
 * @route   GET /api/subscriptions/:id
 * @desc    Get subscription by ID
 * @access  Private (owner only)
 */
router.get(
  '/:id',
  authMiddleware.authenticate,
  validateParams(subscriptionIdParamsSchema),
  ErrorHandler.asyncHandler(subscriptionController.getSubscriptionById)
);

/**
 * @route   POST /api/subscriptions/:subscriptionId/pay
 * @desc    Make payment for existing subscription
 * @access  Private (owner only)
 */
router.post(
  '/:subscriptionId/pay',
  authMiddleware.authenticate,
  validateParams(makePaymentParamsSchema),
  validateBody(makePaymentSchema),
  ErrorHandler.asyncHandler(subscriptionController.makePayment)
);

/**
 * @route   GET /api/subscriptions/transactions/my-transactions
 * @desc    Get current user's transactions
 * @access  Private (authenticated users)
 */
router.get(
  '/transactions/my-transactions',
  authMiddleware.authenticate,
  ErrorHandler.asyncHandler(subscriptionController.getUserTransactions)
);

/**
 * @route   GET /api/subscriptions/:subscriptionId/transactions
 * @desc    Get transactions for a specific subscription
 * @access  Private (owner only)
 */
router.get(
  '/:subscriptionId/transactions',
  authMiddleware.authenticate,
  validateParams(subscriptionTransactionsParamsSchema),
  ErrorHandler.asyncHandler(subscriptionController.getSubscriptionTransactions)
);

/**
 * @route   PATCH /api/subscriptions/:id/cancel
 * @desc    Cancel subscription
 * @access  Private (owner only)
 */
router.patch(
  '/:id/cancel',
  authMiddleware.authenticate,
  validateParams(subscriptionIdParamsSchema),
  validateBody(cancelSubscriptionSchema),
  ErrorHandler.asyncHandler(subscriptionController.cancelSubscription)
);

/**
 * @route   GET /api/subscriptions/stats/payments
 * @desc    Get payment statistics
 * @access  Private (admin only)
 */
router.get(
  '/stats/payments',
  authMiddleware.authenticate,
  authMiddleware.authorize(UserRole.ADMIN),
  ErrorHandler.asyncHandler(subscriptionController.getPaymentStats)
);

export default router;

