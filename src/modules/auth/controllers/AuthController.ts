import { Response } from 'express';
import { AuthService } from '../services/AuthService';
import { UserRepository } from '../../user/repositories/UserRepository';
import { AuthenticatedRequest, ApiResponse } from '../../../types';

export class AuthController {
  private authService: AuthService;
  private userRepository: UserRepository;

  constructor() {
    this.authService = new AuthService();
    this.userRepository = new UserRepository();
  }

  /**
   * Register a new user
   */
  public register = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const authResponse = await this.authService.register(req.body);

      const response: ApiResponse = {
        success: true,
        message: 'User registered successfully',
        data: authResponse
      };

      res.status(201).json(response);
    } catch (error) {
      console.error('Registration error:', error);
      
      const statusCode = error instanceof Error && error.message.includes('already exists') ? 409 : 500;
      
      const response: ApiResponse = {
        success: false,
        message: error instanceof Error ? error.message : 'Registration failed',
        ...(error instanceof Error && { errors: [error.message] })
      };
      
      res.status(statusCode).json(response);
    }
  };

  /**
   * Login user
   */
  public login = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const authResponse = await this.authService.login(req.body);

      const response: ApiResponse = {
        success: true,
        message: 'Login successful',
        data: authResponse
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Login error:', error);
      
      const statusCode = error instanceof Error && 
        (error.message.includes('Invalid') || error.message.includes('password')) ? 401 :
        error instanceof Error && error.message.includes('not active') ? 403 : 500;
      
      const response: ApiResponse = {
        success: false,
        message: error instanceof Error ? error.message : 'Login failed',
        ...(error instanceof Error && { errors: [error.message] })
      };
      
      res.status(statusCode).json(response);
    }
  };

  /**
   * Refresh access token
   */
  public refreshToken = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { refreshToken } = req.body;
      const authResponse = await this.authService.refreshToken(refreshToken);

      const response: ApiResponse = {
        success: true,
        message: 'Token refreshed successfully',
        data: authResponse
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Refresh token error:', error);
      const response: ApiResponse = {
        success: false,
        message: error instanceof Error ? error.message : 'Token refresh failed',
        ...(error instanceof Error && { errors: [error.message] })
      };
      res.status(401).json(response);
    }
  };

  /**
   * Logout user
   */
  public logout = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { refreshToken } = req.body;
      await this.authService.logout(refreshToken);

      const response: ApiResponse = {
        success: true,
        message: 'Logout successful'
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Logout error:', error);
      const response: ApiResponse = {
        success: false,
        message: error instanceof Error ? error.message : 'Logout failed',
        ...(error instanceof Error && { errors: [error.message] })
      };
      res.status(500).json(response);
    }
  };

  /**
   * Logout from all devices
   */
  public logoutAll = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        const response: ApiResponse = {
          success: false,
          message: 'User not authenticated'
        };
        res.status(401).json(response);
        return;
      }

      await this.authService.logoutAll(req.user._id.toString());

      const response: ApiResponse = {
        success: true,
        message: 'Logged out from all devices successfully'
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Logout all error:', error);
      const response: ApiResponse = {
        success: false,
        message: error instanceof Error ? error.message : 'Logout from all devices failed',
        ...(error instanceof Error && { errors: [error.message] })
      };
      res.status(500).json(response);
    }
  };

  /**
   * Get current user profile
   */
  public getProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        const response: ApiResponse = {
          success: false,
          message: 'User not authenticated'
        };
        res.status(401).json(response);
        return;
      }

      // Fetch user with populated subscription
      const userWithSubscription = await this.userRepository.findById(req.user._id.toString());
      
      if (!userWithSubscription) {
        const response: ApiResponse = {
          success: false,
          message: 'User not found'
        };
        res.status(404).json(response);
        return;
      }

      // Populate subscription if it exists
      if (userWithSubscription.subscription) {
        await userWithSubscription.populate('subscription');
      }

      const response: ApiResponse = {
        success: true,
        message: 'Profile retrieved successfully',
        data: userWithSubscription
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Get profile error:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to retrieve profile',
        ...(error instanceof Error && { errors: [error.message] })
      };
      res.status(500).json(response);
    }
  };

  /**
   * Change password
   */
  public changePassword = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        const response: ApiResponse = {
          success: false,
          message: 'User not authenticated'
        };
        res.status(401).json(response);
        return;
      }

      const { currentPassword, newPassword } = req.body;
      await this.authService.changePassword(req.user._id.toString(), currentPassword, newPassword);

      const response: ApiResponse = {
        success: true,
        message: 'Password changed successfully. Please login again.'
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Change password error:', error);
      
      const statusCode = error instanceof Error && error.message.includes('incorrect') ? 400 : 500;
      
      const response: ApiResponse = {
        success: false,
        message: error instanceof Error ? error.message : 'Password change failed',
        ...(error instanceof Error && { errors: [error.message] })
      };
      
      res.status(statusCode).json(response);
    }
  };

  /**
   * Verify email with token
   */
  public verifyEmail = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { token } = req.body;
      await this.authService.verifyEmail(token);

      const response: ApiResponse = {
        success: true,
        message: 'Email verified successfully'
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Verify email error:', error);
      const response: ApiResponse = {
        success: false,
        message: error instanceof Error ? error.message : 'Email verification failed',
        ...(error instanceof Error && { errors: [error.message] })
      };
      res.status(400).json(response);
    }
  };

  /**
   * Request password reset
   */
  public forgotPassword = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { email } = req.body;
      const resetToken = await this.authService.forgotPassword(email);

      const response: ApiResponse = {
        success: true,
        message: 'Password reset instructions have been sent to your email',
        // In production, don't send the token in response - send it via email
        // data: { resetToken }
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Forgot password error:', error);
      const response: ApiResponse = {
        success: false,
        message: error instanceof Error ? error.message : 'Password reset request failed',
        ...(error instanceof Error && { errors: [error.message] })
      };
      res.status(500).json(response);
    }
  };

  /**
   * Reset password with token
   */
  public resetPassword = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { token, newPassword } = req.body;
      await this.authService.resetPassword(token, newPassword);

      const response: ApiResponse = {
        success: true,
        message: 'Password reset successfully. Please login with your new password.'
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Reset password error:', error);
      const response: ApiResponse = {
        success: false,
        message: error instanceof Error ? error.message : 'Password reset failed',
        ...(error instanceof Error && { errors: [error.message] })
      };
      res.status(400).json(response);
    }
  };

  /**
   * Resend verification email
   */
  public resendVerification = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { email } = req.body;
      const verificationToken = await this.authService.resendVerificationEmail(email);

      const response: ApiResponse = {
        success: true,
        message: 'Verification email has been sent',
        // In production, don't send the token in response - send it via email
        // data: { verificationToken }
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Resend verification error:', error);
      const response: ApiResponse = {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to resend verification email',
        ...(error instanceof Error && { errors: [error.message] })
      };
      res.status(400).json(response);
    }
  };

  /**
   * Update user details
   */
  public updateUserDetails = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        const response: ApiResponse = {
          success: false,
          message: 'User not authenticated'
        };
        res.status(401).json(response);
        return;
      }

      const updateData = req.body;
      const updatedUser = await this.userRepository.updateUserDetails(req.user._id, updateData);

      if (!updatedUser) {
        const response: ApiResponse = {
          success: false,
          message: 'Failed to update user details'
        };
        res.status(500).json(response);
        return;
      }

      const response: ApiResponse = {
        success: true,
        message: 'User details updated successfully',
        data: updatedUser
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Update user details error:', error);
      const response: ApiResponse = {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update user details',
        ...(error instanceof Error && { errors: [error.message] })
      };
      res.status(500).json(response);
    }
  };
}
