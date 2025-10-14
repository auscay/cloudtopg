import { Router } from 'express';
import { AdminController } from '../controllers/AdminController';
import { authMiddleware } from '../../auth/middleware/auth';
import { ErrorHandler } from '../../../middleware/errorHandler';
import { UserRole } from '../../../types';

const router = Router();
const adminController = new AdminController();

// Admin routes (require admin role)
router.get(
  '/users',
  authMiddleware.authenticate,
  authMiddleware.authorize(UserRole.ADMIN),
  ErrorHandler.asyncHandler(adminController.getAllUsers)
);

// Development only - clear all users
router.delete(
  '/users/clear',
  ErrorHandler.asyncHandler(adminController.clearUsers)
);

export default router;
