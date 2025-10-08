import { Response, NextFunction } from 'express';
import { JwtService } from '../services/JwtService';
import { UserRepository } from '../../user/repositories/UserRepository';
import { AuthenticatedRequest, ApiResponse, UserRole, UserStatus } from '../../../types';

export class AuthMiddleware {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  /**
   * Authenticate user using JWT token
   */
  public authenticate = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;
      const token = JwtService.extractTokenFromHeader(authHeader);

      if (!token) {
        const response: ApiResponse = {
          success: false,
          message: 'Access token is required'
        };
        res.status(401).json(response);
        return;
      }

      // Verify token
      const payload = JwtService.verifyAccessToken(token);

      // Find user
      const user = await this.userRepository.findById(payload.userId);
      if (!user) {
        const response: ApiResponse = {
          success: false,
          message: 'User not found'
        };
        res.status(404).json(response);
        return;
      }

      // Check if user is active
      if (user.status !== UserStatus.ACTIVE) {
        const response: ApiResponse = {
          success: false,
          message: 'Account is not active'
        };
        res.status(403).json(response);
        return;
      }

      // Attach user to request
      req.user = user;
      next();
    } catch (error) {
      console.error('Authentication error:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Authentication failed',
        errors: [error instanceof Error ? error.message : 'Invalid token']
      };
      res.status(401).json(response);
    }
  };

  /**
   * Authorize user based on roles
   */
  public authorize = (...roles: UserRole[]) => {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
      if (!req.user) {
        const response: ApiResponse = {
          success: false,
          message: 'Authentication required'
        };
        res.status(401).json(response);
        return;
      }

      if (!roles.includes(req.user.role as UserRole)) {
        const response: ApiResponse = {
          success: false,
          message: 'Insufficient permissions'
        };
        res.status(403).json(response);
        return;
      }

      next();
    };
  };
}

// Export singleton instance
export const authMiddleware = new AuthMiddleware();
