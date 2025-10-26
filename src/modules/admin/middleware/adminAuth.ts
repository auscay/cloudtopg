import { Request, Response, NextFunction } from 'express';
import { JwtService } from '../../auth/services/JwtService';
import { AdminRepository } from '../repositories/AdminRepository';
import { AdminRole, AdminPermission, IAdmin } from '../../../types';

// Extend Request interface to include admin
declare global {
  namespace Express {
    interface Request {
      admin?: IAdmin;
    }
  }
}

export class AdminAuthMiddleware {
  private adminRepository: AdminRepository;

  constructor() {
    this.adminRepository = new AdminRepository();
  }

  /**
   * Authenticate admin using JWT token
   */
  authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;
      const token = JwtService.extractTokenFromHeader(authHeader);
      
      if (!token) {
        res.status(401).json({
          success: false,
          message: 'Access denied. No token provided.'
        });
        return;
      }

      // Verify token
      const decoded = JwtService.verifyAdminAccessToken(token);
      
      // Get admin from database
      const admin = await this.adminRepository.findById(decoded.adminId);
      
      if (!admin) {
        res.status(401).json({
          success: false,
          message: 'Invalid token. Admin not found.'
        });
        return;
      }

      // Check if admin is active
      if (admin.status !== 'active') {
        res.status(401).json({
          success: false,
          message: 'Account is inactive or suspended.'
        });
        return;
      }

      // Attach admin to request
      req.admin = admin;
      next();
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('expired')) {
          res.status(401).json({
            success: false,
            message: 'Token expired.'
          });
          return;
        }
        
        if (error.message.includes('Invalid')) {
          res.status(401).json({
            success: false,
            message: 'Invalid token.'
          });
          return;
        }
      }

      console.error('Admin authentication error:', error);
      res.status(500).json({
        success: false,
        message: 'Authentication failed.'
      });
    }
  };

  /**
   * Authorize admin based on role
   */
  authorize = (requiredRole: AdminRole) => {
    return (req: Request, res: Response, next: NextFunction): void => {
      if (!req.admin) {
        res.status(401).json({
          success: false,
          message: 'Authentication required.'
        });
        return;
      }

      const adminRole = req.admin.role;
      
      // Define role hierarchy
      const roleHierarchy = {
        [AdminRole.SUPER_ADMIN]: 3,
        [AdminRole.ADMIN]: 2,
        [AdminRole.MODERATOR]: 1
      };

      const adminLevel = roleHierarchy[adminRole];
      const requiredLevel = roleHierarchy[requiredRole];

      if (adminLevel < requiredLevel) {
        res.status(403).json({
          success: false,
          message: 'Insufficient permissions. Required role: ' + requiredRole
        });
        return;
      }

      next();
    };
  };

  /**
   * Check if admin has specific permission
   */
  requirePermission = (permission: AdminPermission) => {
    return (req: Request, res: Response, next: NextFunction): void => {
      if (!req.admin) {
        res.status(401).json({
          success: false,
          message: 'Authentication required.'
        });
        return;
      }

      if (!req.admin.hasPermission(permission)) {
        res.status(403).json({
          success: false,
          message: `Permission required: ${permission}`
        });
        return;
      }

      next();
    };
  };

  /**
   * Check if admin can manage another admin
   */
  canManageAdmin = (req: Request, res: Response, next: NextFunction): void => {
    if (!req.admin) {
      res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
      return;
    }

    const targetAdminId = req.params.id;
    
    // If trying to manage self, allow (for profile updates)
    if (req.admin._id.toString() === targetAdminId) {
      next();
      return;
    }

    // Super admin can manage everyone
    if (req.admin.role === AdminRole.SUPER_ADMIN) {
      next();
      return;
    }

    // For other operations, require super admin role
    res.status(403).json({
      success: false,
      message: 'Only super admins can manage other admins.'
    });
  };

  /**
   * Optional authentication - doesn't fail if no token
   */
  optionalAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;
      const token = JwtService.extractTokenFromHeader(authHeader);
      
      if (!token) {
        next();
        return;
      }

      const decoded = JwtService.verifyAdminAccessToken(token);
      const admin = await this.adminRepository.findById(decoded.adminId);
      
      if (admin && admin.status === 'active') {
        req.admin = admin;
      }

      next();
    } catch (error) {
      // Ignore authentication errors for optional auth
      next();
    }
  };
}

export const adminAuthMiddleware = new AdminAuthMiddleware();
