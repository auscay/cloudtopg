import { Types } from 'mongoose';
import { User } from '../models/User';
import { BaseRepository } from './BaseRepository';
import { IUser, UserRole, UserStatus, CreateUserData, UpdateUserData } from '../../../types';

export class UserRepository extends BaseRepository<IUser> {
  constructor() {
    super(User);
  }

  /**
   * Create a new user with validation
   */
  async createUser(userData: CreateUserData): Promise<IUser> {
    // Check if user with email already exists
    const existingUser = await this.findByEmail(userData.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    return await this.create(userData);
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<IUser | null> {
    return await this.model.findOne({ email: email.toLowerCase() });
  }

  /**
   * Find user by email with password (for authentication)
   */
  async findByEmailWithPassword(email: string): Promise<IUser | null> {
    return await this.model.findOne({ email: email.toLowerCase() }).select('+password');
  }

  /**
   * Find user by ID with password
   */
  async findByIdWithPassword(id: string | Types.ObjectId): Promise<IUser | null> {
    return await this.model.findById(id).select('+password');
  }

  /**
   * Find users by role
   */
  async findByRole(role: UserRole): Promise<IUser[]> {
    return await this.findMany({ role });
  }

  /**
   * Find users by status
   */
  async findByStatus(status: UserStatus): Promise<IUser[]> {
    return await this.findMany({ status });
  }

  /**
   * Find active users (not withdrawn)
   */
  async findActiveUsers(): Promise<IUser[]> {
    return await this.findMany({ 
      status: { $in: [UserStatus.ENROLLED, UserStatus.ADMITTED, UserStatus.APPLIED] }
    });
  }

  /**
   * Update user status
   */
  async updateStatus(userId: string | Types.ObjectId, status: UserStatus): Promise<IUser | null> {
    return await this.updateById(userId, { status });
  }

  /**
   * Update last login time
   */
  async updateLastLogin(userId: string | Types.ObjectId): Promise<IUser | null> {
    return await this.updateById(userId, { lastLogin: new Date() });
  }

  /**
   * Update user details
   */
  async updateUserDetails(userId: string | Types.ObjectId, updateData: UpdateUserData): Promise<IUser | null> {
    return await this.updateById(userId, updateData);
  }

  /**
   * Add refresh token to user
   */
  async addRefreshToken(userId: string | Types.ObjectId, token: string): Promise<IUser | null> {
    return await this.model.findByIdAndUpdate(
      userId,
      { $push: { refreshTokens: token } },
      { new: true }
    );
  }

  /**
   * Remove refresh token from user
   */
  async removeRefreshToken(userId: string | Types.ObjectId, token: string): Promise<IUser | null> {
    return await this.model.findByIdAndUpdate(
      userId,
      { $pull: { refreshTokens: token } },
      { new: true }
    );
  }

  /**
   * Clear all refresh tokens for user
   */
  async clearAllRefreshTokens(userId: string | Types.ObjectId): Promise<IUser | null> {
    return await this.updateById(userId, { refreshTokens: [] });
  }

  /**
   * Update user password
   */
  async updatePassword(userId: string | Types.ObjectId, newPassword: string): Promise<IUser | null> {
    const user = await this.findById(userId);
    if (!user) return null;
    
    user.password = newPassword;
    await user.save();
    return user;
  }

  /**
   * Update user email verification status
   */
  async updateEmailVerification(userId: string | Types.ObjectId, isVerified: boolean): Promise<IUser | null> {
    return await this.updateById(userId, { 
      isEmailVerified: isVerified,
      emailVerificationToken: undefined 
    });
  }

  /**
   * Set email verification token
   */
  async setEmailVerificationToken(userId: string | Types.ObjectId, token: string): Promise<IUser | null> {
    return await this.updateById(userId, { emailVerificationToken: token });
  }

  /**
   * Set password reset token
   */
  async setPasswordResetToken(userId: string | Types.ObjectId, token: string, expiresAt: Date): Promise<IUser | null> {
    return await this.updateById(userId, { 
      passwordResetToken: token,
      passwordResetExpires: expiresAt 
    });
  }

  /**
   * Clear password reset token
   */
  async clearPasswordResetToken(userId: string | Types.ObjectId): Promise<IUser | null> {
    return await this.updateById(userId, { 
      passwordResetToken: undefined,
      passwordResetExpires: undefined 
    });
  }

  /**
   * Find user by email verification token
   */
  async findByEmailVerificationToken(token: string): Promise<IUser | null> {
    return await this.model.findOne({ emailVerificationToken: token }).select('+emailVerificationToken');
  }

  /**
   * Find user by password reset token
   */
  async findByPasswordResetToken(token: string): Promise<IUser | null> {
    return await this.model.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: new Date() }
    }).select('+passwordResetToken +passwordResetExpires');
  }
}
