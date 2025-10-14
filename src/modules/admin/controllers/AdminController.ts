import { Response } from 'express';
import { UserRepository } from '../../user/repositories/UserRepository';
import { AuthenticatedRequest, ApiResponse } from '../../../types';

export class AdminController {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  /**
   * Get all users (admin only)
   */
  public getAllUsers = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const users = await this.userRepository.findMany();
      
      const response: ApiResponse = {
        success: true,
        message: 'Users retrieved successfully',
        data: users
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Get all users error:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to retrieve users',
        ...(error instanceof Error && { errors: [error.message] })
      };
      res.status(500).json(response);
    }
  };

  /**
   * Clear all users (DEVELOPMENT ONLY)
   */
  public clearUsers = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      // Only allow in development mode
      if (process.env.NODE_ENV !== 'development') {
        const response: ApiResponse = {
          success: false,
          message: 'This endpoint is only available in development mode'
        };
        res.status(403).json(response);
        return;
      }

      const deletedCount = await this.userRepository.deleteMany({});
      
      const response: ApiResponse = {
        success: true,
        message: 'All users cleared successfully',
        data: { deletedCount }
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Clear users error:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to clear users',
        ...(error instanceof Error && { errors: [error.message] })
      };
      res.status(500).json(response);
    }
  };
}
