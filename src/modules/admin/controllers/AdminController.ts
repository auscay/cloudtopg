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
        errors: [error instanceof Error ? error.message : 'Unknown error occurred']
      };
      res.status(500).json(response);
    }
  };
}
