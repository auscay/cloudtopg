import { Router } from 'express';
import { ApplicationFeeController } from '../controllers/ApplicationFeeController';
import { authMiddleware } from '../../auth/middleware/auth';
import { ErrorHandler } from '../../../middleware/errorHandler';
import { validateBody, validateQuery } from '../../../middleware/validation';
import {
  initiatePaymentSchema,
  verifyPaymentQuerySchema
} from '../validators/applicationFeeValidators';
import { UserRole } from '../../../types';

const router = Router();
const applicationFeeController = new ApplicationFeeController();

/**
 * @route   POST /api/application-fee/pay
 * @desc    Initiate application fee payment
 * @access  Private (authenticated users)
 */
router.post(
  '/pay',
  authMiddleware.authenticate,
  validateBody(initiatePaymentSchema),
  ErrorHandler.asyncHandler(applicationFeeController.initiatePayment)
);

/**
 * @route   GET /api/application-fee/verify
 * @desc    Verify application fee payment
 * @access  Private (authenticated users)
 */
router.get(
  '/verify',
  authMiddleware.authenticate,
  validateQuery(verifyPaymentQuerySchema),
  ErrorHandler.asyncHandler(applicationFeeController.verifyPayment)
);

/**
 * @route   GET /api/application-fee/status
 * @desc    Get user's application fee payment status
 * @access  Private (authenticated users)
 */
router.get(
  '/status',
  authMiddleware.authenticate,
  ErrorHandler.asyncHandler(applicationFeeController.getPaymentStatus)
);

/**
 * @route   GET /api/application-fee/check
 * @desc    Check if user has paid application fee
 * @access  Private (authenticated users)
 */
router.get(
  '/check',
  authMiddleware.authenticate,
  ErrorHandler.asyncHandler(applicationFeeController.checkPaymentStatus)
);

/**
 * @route   GET /api/application-fee/stats
 * @desc    Get application fee statistics
 * @access  Private (admin only)
 */
router.get(
  '/stats',
  authMiddleware.authenticate,
  authMiddleware.authorize(UserRole.ADMIN),
  ErrorHandler.asyncHandler(applicationFeeController.getStatistics)
);

export default router;

