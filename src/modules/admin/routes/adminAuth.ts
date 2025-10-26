import { Router } from 'express';
import { AdminAuthController } from '../controllers/AdminAuthController';
import { adminAuthMiddleware } from '../middleware/adminAuth';
import { ErrorHandler } from '../../../middleware/errorHandler';
import { validateBody, validateQuery, validateParams } from '../../../middleware/validation';
import {
  adminLoginSchema,
  changeAdminPasswordSchema,
  refreshTokenSchema
} from '../validators/adminValidators';

const router = Router();
const adminAuthController = new AdminAuthController();

// ==================== ADMIN AUTHENTICATION ROUTES ====================

// Admin login
router.post(
  '/login',
  validateBody(adminLoginSchema),
  ErrorHandler.asyncHandler(adminAuthController.login)
);

// Refresh admin token
router.post(
  '/refresh-token',
  validateBody(refreshTokenSchema),
  ErrorHandler.asyncHandler(adminAuthController.refreshToken)
);

// Admin logout
router.post(
  '/logout',
  adminAuthMiddleware.authenticate,
  ErrorHandler.asyncHandler(adminAuthController.logout)
);

// Get admin profile
router.get(
  '/profile',
  adminAuthMiddleware.authenticate,
  ErrorHandler.asyncHandler(adminAuthController.getProfile)
);

// Change admin password
router.put(
  '/change-password',
  adminAuthMiddleware.authenticate,
  validateBody(changeAdminPasswordSchema),
  ErrorHandler.asyncHandler(adminAuthController.changePassword)
);

export default router;
