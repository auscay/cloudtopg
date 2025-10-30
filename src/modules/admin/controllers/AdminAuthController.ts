import { Response } from 'express';
import { AdminService } from '../services/AdminService';
import { AdminRepository } from '../repositories/AdminRepository';
import { 
  AuthenticatedRequest, 
  ApiResponse, 
  AdminLoginCredentials,
  AdminRole,
  AdminStatus 
} from '../../../types';
import { JwtService } from '../../auth/services/JwtService';

export class AdminAuthController {
  private adminService: AdminService;
  private adminRepository: AdminRepository;

  constructor() {
    this.adminService = new AdminService();
    this.adminRepository = new AdminRepository();
  }

  /**
   * Login admin
   */
  public login = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const credentials: AdminLoginCredentials = req.body;
      
      // Find admin by email with password
      const admin = await this.adminRepository.findByEmailWithPassword(credentials.email);
      
      if (!admin) {
        const response: ApiResponse = {
          success: false,
          message: 'Invalid email or password'
        };
        res.status(401).json(response);
        return;
      }

      // Check if admin is active
      if (admin.status !== AdminStatus.ACTIVE) {
        const response: ApiResponse = {
          success: false,
          message: 'Account is inactive or suspended'
        };
        res.status(403).json(response);
        return;
      }

      console.log(credentials)

      // Verify password
      const isPasswordValid = await this.adminService.verifyAdminPassword(admin, credentials.password);
      
      if (!isPasswordValid) {
        const response: ApiResponse = {
          success: false,
          message: 'Invalid email or password'
        };
        res.status(401).json(response);
        return;
      }

      // Update last login
      await this.adminService.updateLastLogin(admin._id);

      // Generate tokens
      const accessToken = JwtService.generateAdminAccessToken({
        adminId: admin._id.toString(),
        role: admin.role,
        permissions: admin.permissions
      });

      const refreshToken = admin.generateRefreshToken();
      
      // Add refresh token to admin
      await this.adminService.addRefreshToken(admin._id, refreshToken);

      const response: ApiResponse = {
        success: true,
        message: 'Login successful',
        data: {
          user: {
            _id: admin._id,
            firstName: admin.firstName,
            lastName: admin.lastName,
            email: admin.email,
            role: admin.role
          },
          tokens: {
            accessToken,
            refreshToken
          }
        }
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Admin login error:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Login failed',
        ...(error instanceof Error && { errors: [error.message] })
      };
      res.status(500).json(response);
    }
  };

  /**
   * Refresh admin token
   */
  public refreshToken = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        const response: ApiResponse = {
          success: false,
          message: 'Refresh token is required'
        };
        res.status(400).json(response);
        return;
      }

      // Verify refresh token
      const payload = JwtService.verifyAdminRefreshToken(refreshToken);
      
      // Find admin
      const admin = await this.adminRepository.findById(payload.adminId);
      
      if (!admin) {
        const response: ApiResponse = {
          success: false,
          message: 'Invalid refresh token'
        };
        res.status(401).json(response);
        return;
      }

      // Check if admin is active
      if (admin.status !== AdminStatus.ACTIVE) {
        const response: ApiResponse = {
          success: false,
          message: 'Account is inactive or suspended'
        };
        res.status(403).json(response);
        return;
      }

      // Check if refresh token exists in admin's tokens
      if (!admin.refreshTokens.includes(refreshToken)) {
        const response: ApiResponse = {
          success: false,
          message: 'Invalid refresh token'
        };
        res.status(401).json(response);
        return;
      }

      // Generate new access token
      const newAccessToken = JwtService.generateAdminAccessToken({
        adminId: admin._id.toString(),
        role: admin.role,
        permissions: admin.permissions
      });

      const response: ApiResponse = {
        success: true,
        message: 'Token refreshed successfully',
        data: {
          accessToken: newAccessToken
        }
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Admin refresh token error:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Token refresh failed',
        ...(error instanceof Error && { errors: [error.message] })
      };
      res.status(401).json(response);
    }
  };

  /**
   * Logout admin
   */
  public logout = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { refreshToken } = req.body;
      const adminId = req.admin?._id;

      if (!adminId) {
        const response: ApiResponse = {
          success: false,
          message: 'Authentication required'
        };
        res.status(401).json(response);
        return;
      }

      if (refreshToken) {
        // Remove specific refresh token
        await this.adminService.removeRefreshToken(adminId, refreshToken);
      } else {
        // Clear all refresh tokens
        await this.adminService.clearRefreshTokens(adminId);
      }

      const response: ApiResponse = {
        success: true,
        message: 'Logout successful'
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Admin logout error:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Logout failed',
        ...(error instanceof Error && { errors: [error.message] })
      };
      res.status(500).json(response);
    }
  };

  /**
   * Get current admin profile
   */
  public getProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const admin = req.admin;

      if (!admin) {
        const response: ApiResponse = {
          success: false,
          message: 'Authentication required'
        };
        res.status(401).json(response);
        return;
      }

      const response: ApiResponse = {
        success: true,
        message: 'Profile retrieved successfully',
        data: {
          _id: admin._id,
          firstName: admin.firstName,
          lastName: admin.lastName,
          email: admin.email,
          role: admin.role,
          permissions: admin.permissions,
          phoneNumber: admin.phoneNumber,
          profilePicture: admin.profilePicture,
          isEmailVerified: admin.isEmailVerified,
          lastLogin: admin.lastLogin,
          createdAt: admin.createdAt,
          updatedAt: admin.updatedAt
        }
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Get admin profile error:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to retrieve profile',
        ...(error instanceof Error && { errors: [error.message] })
      };
      res.status(500).json(response);
    }
  };

  /**
   * Change admin password
   */
  public changePassword = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { currentPassword, newPassword } = req.body;
      const admin = req.admin;

      if (!admin) {
        const response: ApiResponse = {
          success: false,
          message: 'Authentication required'
        };
        res.status(401).json(response);
        return;
      }

      // Verify current password
      const isCurrentPasswordValid = await this.adminService.verifyAdminPassword(admin, currentPassword);
      
      if (!isCurrentPasswordValid) {
        const response: ApiResponse = {
          success: false,
          message: 'Current password is incorrect'
        };
        res.status(400).json(response);
        return;
      }

      // Update password
      await this.adminRepository.updateById(admin._id, { password: newPassword });

      // Clear all refresh tokens to force re-login
      await this.adminService.clearRefreshTokens(admin._id);

      const response: ApiResponse = {
        success: true,
        message: 'Password changed successfully. Please login again.'
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Change admin password error:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to change password',
        ...(error instanceof Error && { errors: [error.message] })
      };
      res.status(500).json(response);
    }
  };
}
