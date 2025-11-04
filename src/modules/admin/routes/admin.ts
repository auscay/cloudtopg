import { Router } from 'express';
import { AdminController } from '../controllers/AdminController';
import { adminAuthMiddleware } from '../middleware/adminAuth';
import { ErrorHandler } from '../../../middleware/errorHandler';
import { validate, validateBody, validateQuery, validateParams } from '../../../middleware/validation';
import { 
  UserRole, 
  AdminRole, 
  AdminPermission 
} from '../../../types';
import {
  createAdminSchema,
  updateAdminSchema,
  updateAdminStatusSchema,
  updateAdminPermissionsSchema,
  adminSearchSchema,
  adminPaginationSchema,
  adminIdSchema,
  userFiltersSchema,
  userIdSchema
} from '../validators/adminValidators';

const router = Router();
const adminController = new AdminController();

// ==================== USER MANAGEMENT ROUTES ====================

// Get all users (admin only)
router.get(
  '/users',
  adminAuthMiddleware.authenticate,
  adminAuthMiddleware.authorize(AdminRole.ADMIN),
  validateQuery(userFiltersSchema),
  ErrorHandler.asyncHandler(adminController.getAllUsers)
);

// Get user by ID (admin only)
router.get(
  '/users/:id',
  adminAuthMiddleware.authenticate,
  adminAuthMiddleware.authorize(AdminRole.ADMIN),
  validateParams(userIdSchema),
  ErrorHandler.asyncHandler(adminController.getUserById)
);

// Get user counts by status (admin only)
router.get(
  '/users/stats/status',
  adminAuthMiddleware.authenticate,
  adminAuthMiddleware.authorize(AdminRole.ADMIN),
  ErrorHandler.asyncHandler(adminController.getUserStatusCounts)
);

// Development only - clear all users
router.delete(
  '/users/clear',
  ErrorHandler.asyncHandler(adminController.clearUsers)
);

// ==================== ADMIN MANAGEMENT ROUTES ====================

// Create new admin (super admin only)
router.post(
  '/',
  adminAuthMiddleware.authenticate,
  adminAuthMiddleware.authorize(AdminRole.SUPER_ADMIN),
  validateBody(createAdminSchema),
  ErrorHandler.asyncHandler(adminController.createAdmin)
);

// Get all admins with pagination and filters
router.get(
  '/',
  adminAuthMiddleware.authenticate,
  adminAuthMiddleware.authorize(AdminRole.ADMIN),
  validateQuery(adminPaginationSchema),
  ErrorHandler.asyncHandler(adminController.getAllAdmins)
);

// Get admin statistics
router.get(
  '/stats',
  adminAuthMiddleware.authenticate,
  adminAuthMiddleware.authorize(AdminRole.ADMIN),
  ErrorHandler.asyncHandler(adminController.getAdminStats)
);

// Marketing funnel stats (Admin only)
router.get(
  '/stats/marketing-funnel',
  adminAuthMiddleware.authenticate,
  adminAuthMiddleware.authorize(AdminRole.ADMIN),
  ErrorHandler.asyncHandler(adminController.getMarketingFunnelStats)
);

// Search admins
router.get(
  '/search',
  adminAuthMiddleware.authenticate,
  adminAuthMiddleware.authorize(AdminRole.ADMIN),
  validateQuery(adminSearchSchema),
  ErrorHandler.asyncHandler(adminController.searchAdmins)
);

// Get admins by role
router.get(
  '/role/:role',
  adminAuthMiddleware.authenticate,
  adminAuthMiddleware.authorize(AdminRole.ADMIN),
  ErrorHandler.asyncHandler(adminController.getAdminsByRole)
);

// Get admins by permission
router.get(
  '/permission/:permission',
  adminAuthMiddleware.authenticate,
  adminAuthMiddleware.authorize(AdminRole.ADMIN),
  ErrorHandler.asyncHandler(adminController.getAdminsByPermission)
);

// Get admin by ID
router.get(
  '/:id',
  adminAuthMiddleware.authenticate,
  adminAuthMiddleware.authorize(AdminRole.ADMIN),
  validateParams(adminIdSchema),
  ErrorHandler.asyncHandler(adminController.getAdminById)
);

// Update admin
router.put(
  '/:id',
  adminAuthMiddleware.authenticate,
  adminAuthMiddleware.authorize(AdminRole.ADMIN),
  validateParams(adminIdSchema),
  validateBody(updateAdminSchema),
  ErrorHandler.asyncHandler(adminController.updateAdmin)
);

// Update admin status
router.patch(
  '/:id/status',
  adminAuthMiddleware.authenticate,
  adminAuthMiddleware.authorize(AdminRole.SUPER_ADMIN),
  validateParams(adminIdSchema),
  validateBody(updateAdminStatusSchema),
  ErrorHandler.asyncHandler(adminController.updateAdminStatus)
);

// Update admin permissions
router.patch(
  '/:id/permissions',
  adminAuthMiddleware.authenticate,
  adminAuthMiddleware.authorize(AdminRole.SUPER_ADMIN),
  validateParams(adminIdSchema),
  validateBody(updateAdminPermissionsSchema),
  ErrorHandler.asyncHandler(adminController.updateAdminPermissions)
);

// Delete admin
router.delete(
  '/:id',
  adminAuthMiddleware.authenticate,
  adminAuthMiddleware.authorize(AdminRole.SUPER_ADMIN),
  validateParams(adminIdSchema),
  ErrorHandler.asyncHandler(adminController.deleteAdmin)
);

export default router;
