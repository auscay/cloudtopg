import crypto from 'crypto';
import { UserRepository } from '../../user/repositories/UserRepository';
import { JwtService } from './JwtService';
import { AuthResponse, CreateUserData, LoginCredentials, AuthTokens } from '../../../types';
import { UserStatus, PaymentPlanType } from '../../../types';
import { sendVerificationEmail } from '../../email/emails/sendVerificationEmail';
import { sendPasswordResetEmail } from '../../email/emails/sendPasswordResetEmail';
import { sendWelcomeEmail } from '../../email/emails/sendWelcomeEmail';
import { SubscriptionService } from '../../subscription/services/SubscriptionService';

export class AuthService {
  private userRepository: UserRepository;
  private subscriptionService: SubscriptionService;

  constructor() {
    this.userRepository = new UserRepository();
    this.subscriptionService = new SubscriptionService();
  }

  /**
   * Register a new user
   */
  async register(userData: CreateUserData): Promise<AuthResponse> {
    try {
      // Check if user already exists
      const existingUser = await this.userRepository.findByEmail(userData.email);
      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Create new user
      const newUser = await this.userRepository.createUser(userData);

      if (!newUser) {
        throw new Error('Failed to create user');
      }

      // Create a default pending subscription for the new user
      try {
        const pendingSubscription = await this.subscriptionService.createSubscription({
          userId: newUser._id.toString(),
          planType: PaymentPlanType.EARLY_BIRD, // Default to early bird plan
          metadata: {
            createdDuringRegistration: true,
            registrationDate: new Date()
          }
        });

        // Update user's subscription reference
        await this.userRepository.updateById(newUser._id.toString(), {
          subscription: pendingSubscription._id
        } as any);
      } catch (subscriptionError) {
        console.error('Failed to create default subscription:', subscriptionError);
        // Don't fail registration if subscription creation fails
      }

      // Generate tokens
      const tokenVersion = Date.now();
      const tokens = JwtService.generateTokenPair(
        newUser._id.toString(),
        newUser.email,
        newUser.role,
        tokenVersion
      );

      // Add refresh token to user
      await this.userRepository.addRefreshToken(newUser._id, tokens.refreshToken);

      // Update last login
      await this.userRepository.updateLastLogin(newUser._id);

      // Generate email verification token
      const verificationToken = this.generateVerificationToken();
      await this.userRepository.setEmailVerificationToken(newUser._id, verificationToken);

      // Send verification email
      let emailSent = false;
      try {
        await sendVerificationEmail({
          email: newUser.email,
          userName: `${newUser.firstName} ${newUser.lastName}`,
          verificationCode: verificationToken,
        });
        emailSent = true;
      } catch (emailError) {
        console.error('Failed to send verification email:', emailError);
        // Don't fail registration if email fails
      }

      return {
        user: {
          _id: newUser._id.toString(),
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          email: newUser.email,
          role: newUser.role,
          status: newUser.status,
          isEmailVerified: newUser.isEmailVerified,
          lastLogin: new Date(),
          ...(newUser.phoneNumber && { phoneNumber: newUser.phoneNumber }),
          ...(newUser.howDidYouHearAboutUs && { howDidYouHearAboutUs: newUser.howDidYouHearAboutUs }),
          // ...(!emailSent && { verificationCode: verificationToken })
        },
        tokens
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to register user');
    }
  }

  /**
   * Login user
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const { email, password } = credentials;

      // Find user with password
      const user = await this.userRepository.findByEmailWithPassword(email);
      if (!user) {
        throw new Error('Invalid email or password');
      }

      // Check if user is enrolled or admitted (can login)
      if (user.status === UserStatus.WITHDRAWN) {
        throw new Error('Account is not active. Please contact administrator.');
      }

      // Verify password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        throw new Error('Invalid email or password');
      }

      // Generate tokens
      const tokenVersion = Date.now();
      const tokens = JwtService.generateTokenPair(
        user._id.toString(),
        user.email,
        user.role,
        tokenVersion
      );

      // Add refresh token to user
      await this.userRepository.addRefreshToken(user._id, tokens.refreshToken);

      // Update last login
      await this.userRepository.updateLastLogin(user._id);

      return {
        user: {
          _id: user._id.toString(),
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          status: user.status,
          isEmailVerified: user.isEmailVerified,
          lastLogin: new Date()
        },
        tokens
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to login');
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    try {
      // Verify refresh token
      const payload = JwtService.verifyRefreshToken(refreshToken);

      // Find user
      const user = await this.userRepository.findById(payload.userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Check if refresh token exists in user's tokens
      const User = await import('../../user/models/User');
      const userWithTokens = await User.User.findById(user._id).select('+refreshTokens');
      if (!userWithTokens?.refreshTokens.includes(refreshToken)) {
        throw new Error('Invalid refresh token');
      }

      // Generate new tokens
      const newTokenVersion = Date.now();
      const tokens = JwtService.generateTokenPair(
        user._id.toString(),
        user.email,
        user.role,
        newTokenVersion
      );

      // Remove old refresh token and add new one
      await this.userRepository.removeRefreshToken(user._id, refreshToken);
      await this.userRepository.addRefreshToken(user._id, tokens.refreshToken);

      return {
        user: {
          _id: user._id.toString(),
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          status: user.status,
          isEmailVerified: user.isEmailVerified,
          ...(user.lastLogin && { lastLogin: user.lastLogin })
        },
        tokens
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to refresh token');
    }
  }

  /**
   * Logout user
   */
  async logout(refreshToken: string): Promise<void> {
    try {
      // Verify refresh token to get user ID
      const payload = JwtService.verifyRefreshToken(refreshToken);

      // Remove refresh token from user
      await this.userRepository.removeRefreshToken(payload.userId, refreshToken);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to logout');
    }
  }

  /**
   * Logout from all devices
   */
  async logoutAll(userId: string): Promise<void> {
    try {
      // Clear all refresh tokens for user
      await this.userRepository.clearAllRefreshTokens(userId);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to logout from all devices');
    }
  }

  /**
   * Verify email with token
   */
  async verifyEmail(token: string): Promise<void> {
    try {
      // Find user by verification token
      const user = await this.userRepository.findByEmailVerificationToken(token);
      if (!user) {
        throw new Error('Invalid or expired verification token');
      }

      // Check if email is already verified
      const wasAlreadyVerified = user.isEmailVerified;

      // Update user email verification status
      await this.userRepository.updateEmailVerification(user._id, true);

      // Send welcome email only if email was just verified (not already verified)
      if (!wasAlreadyVerified) {
        try {
          await sendWelcomeEmail({
            email: user.email,
            firstName: user.firstName,
          });
        } catch (emailError) {
          console.error('Failed to send welcome email:', emailError);
          // Don't fail verification if welcome email fails
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to verify email');
    }
  }

  /**
   * Request password reset
   */
  async forgotPassword(email: string): Promise<{ token: string; emailSent: boolean }> {
    try {
      // Find user by email
      const user = await this.userRepository.findByEmail(email);
      if (!user) {
        // Don't reveal if user exists or not for security
        throw new Error('If a user with that email exists, a password reset link has been sent');
      }

      // Generate password reset token
      const resetToken = this.generatePasswordResetToken();
      const resetExpires = new Date(Date.now() + 3600000); // 1 hour from now

      // Save reset token to user
      await this.userRepository.setPasswordResetToken(user._id, resetToken, resetExpires);

      // Send password reset email
      let emailSent = false;
      try {
        await sendPasswordResetEmail({
          email: user.email,
          userName: `${user.firstName} ${user.lastName}`,
          resetCode: resetToken,
        });
        emailSent = true;
      } catch (emailError) {
        console.error('Failed to send password reset email:', emailError);
        // Don't fail password reset request if email fails
      }

      return {
        token: resetToken,
        emailSent
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to process password reset request');
    }
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      // Find user by reset token
      const user = await this.userRepository.findByPasswordResetToken(token);
      if (!user) {
        throw new Error('Invalid or expired password reset token');
      }

      // Update password
      await this.userRepository.updatePassword(user._id, newPassword);

      // Clear password reset token
      await this.userRepository.clearPasswordResetToken(user._id);

      // Clear all refresh tokens to force re-login
      await this.userRepository.clearAllRefreshTokens(user._id);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to reset password');
    }
  }

  /**
   * Change password for authenticated user
   */
  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    try {
      // Get user with password
      const user = await this.userRepository.findByIdWithPassword(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Verify current password
      const isCurrentPasswordValid = await user.comparePassword(currentPassword);
      if (!isCurrentPasswordValid) {
        throw new Error('Current password is incorrect');
      }

      // Update password
      await this.userRepository.updatePassword(user._id, newPassword);

      // Clear all refresh tokens to force re-login
      await this.userRepository.clearAllRefreshTokens(user._id);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to change password');
    }
  }

  /**
   * Resend email verification
   */
  async resendVerificationEmail(email: string): Promise<string> {
    try {
      // Find user by email
      const user = await this.userRepository.findByEmail(email);
      if (!user) {
        throw new Error('User not found');
      }

      // Check if already verified
      if (user.isEmailVerified) {
        throw new Error('Email is already verified');
      }

      // Generate new verification token
      const verificationToken = this.generateVerificationToken();
      await this.userRepository.setEmailVerificationToken(user._id, verificationToken);

      // Send verification email
      await sendVerificationEmail({
        email: user.email,
        userName: `${user.firstName} ${user.lastName}`,
        verificationCode: verificationToken,
      });

      // Return token (for testing purposes, remove in production)
      return verificationToken;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to resend verification email');
    }
  }

  /**
   * Generate email verification token (6-digit code)
   */
  private generateVerificationToken(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Generate password reset token (6-digit code)
   */
  private generatePasswordResetToken(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}
