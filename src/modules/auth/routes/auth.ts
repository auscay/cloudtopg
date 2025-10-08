import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { authMiddleware } from '../middleware/auth';
import { ErrorHandler } from '../../../middleware/errorHandler';
import { validateBody } from '../../../middleware/validation';
import {
  registerSchema,
  loginSchema,
  changePasswordSchema,
  refreshTokenSchema,
  emailVerificationSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  resendVerificationSchema
} from '../validators/authValidators';

const router = Router();
const authController = new AuthController();

// Public routes
router.post(
  '/register',
  validateBody(registerSchema),
  ErrorHandler.asyncHandler(authController.register)
);

router.post(
  '/login',
  validateBody(loginSchema),
  ErrorHandler.asyncHandler(authController.login)
);

router.post(
  '/refresh',
  validateBody(refreshTokenSchema),
  ErrorHandler.asyncHandler(authController.refreshToken)
);

router.post(
  '/logout',
  validateBody(refreshTokenSchema),
  ErrorHandler.asyncHandler(authController.logout)
);

router.post(
  '/verify-email',
  validateBody(emailVerificationSchema),
  ErrorHandler.asyncHandler(authController.verifyEmail)
);

router.post(
  '/forgot-password',
  validateBody(forgotPasswordSchema),
  ErrorHandler.asyncHandler(authController.forgotPassword)
);

router.post(
  '/reset-password',
  validateBody(resetPasswordSchema),
  ErrorHandler.asyncHandler(authController.resetPassword)
);

router.post(
  '/resend-verification',
  validateBody(resendVerificationSchema),
  ErrorHandler.asyncHandler(authController.resendVerification)
);

// Protected routes
router.get(
  '/profile',
  authMiddleware.authenticate,
  ErrorHandler.asyncHandler(authController.getProfile)
);

router.post(
  '/logout-all',
  authMiddleware.authenticate,
  ErrorHandler.asyncHandler(authController.logoutAll)
);

router.put(
  '/change-password',
  authMiddleware.authenticate,
  validateBody(changePasswordSchema),
  ErrorHandler.asyncHandler(authController.changePassword)
);

export default router;
