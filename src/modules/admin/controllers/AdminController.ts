import { Response } from 'express';
import { UserRepository } from '../../user/repositories/UserRepository';
import { AdminRepository } from '../repositories/AdminRepository';
import { 
  AuthenticatedRequest, 
  ApiResponse, 
  CreateAdminData, 
  UpdateAdminData, 
  AdminRole, 
  AdminStatus, 
  AdminPermission, 
  HowDidYouHearAboutUs,
  UserStatus 
} from '../../../types';
import { User } from '../../user/models/User';

export class AdminController {
  private userRepository: UserRepository;
  private adminRepository: AdminRepository;

  constructor() {
    this.userRepository = new UserRepository();
    this.adminRepository = new AdminRepository();
  }

  // ==================== USER MANAGEMENT ====================

  /**
   * Get all users (admin only)
   * Supports filtering by status and howDidYouHearAboutUs
   */
  public getAllUsers = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { status, howDidYouHearAboutUs } = req.query;
      const filters: any = {};
      
      if (status) {
        filters.status = status as UserStatus;
      }
      
      if (howDidYouHearAboutUs) {
        filters.howDidYouHearAboutUs = howDidYouHearAboutUs as HowDidYouHearAboutUs;
      }

      // Find users with populated subscription field
      const users = await User.find(filters).populate('subscription');
      
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
   * Get user by ID (admin only)
   */
  public getUserById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      if (!id) {
        const response: ApiResponse = {
          success: false,
          message: 'User ID is required'
        };
        res.status(400).json(response);
        return;
      }
      
      // Find user with populated subscription field
      const user = await User.findById(id).populate('subscription');

      if (!user) {
        const response: ApiResponse = {
          success: false,
          message: 'User not found'
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse = {
        success: true,
        message: 'User retrieved successfully',
        data: user
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Get user by ID error:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to retrieve user',
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

  /**
   * Get user counts by status (admin only)
   */
  public getUserStatusCounts = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      // Aggregate users by status
      const raw = await User.aggregate([
        {
          $group: {
            _id: {
              $ifNull: ['$status', UserStatus.APPLIED]
            },
            count: { $sum: 1 }
          }
        }
      ]);

      // Transform aggregation results into object format
      const statusCounts: Record<string, number> = {};
      
      // Initialize all statuses with 0
      Object.values(UserStatus).forEach(status => {
        statusCounts[status] = 0;
      });

      // Fill in actual counts
      raw.forEach((r: any) => {
        statusCounts[r._id] = r.count;
      });

      const response: ApiResponse = {
        success: true,
        message: 'User status counts retrieved successfully',
        data: statusCounts
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Get user status counts error:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to retrieve user status counts',
        ...(error instanceof Error && { errors: [error.message] })
      };
      res.status(500).json(response);
    }
  };

  // ==================== ADMIN MANAGEMENT ====================

  /**
   * Create a new admin
   * Role is automatically set to ADMIN by default in the controller
   */
  public createAdmin = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const adminData: CreateAdminData = req.body;
      const createdBy = req.user?.id;

      // Check if admin with email already exists
      const existingAdmin = await this.adminRepository.findByEmail(adminData.email);
      if (existingAdmin) {
        const response: ApiResponse = {
          success: false,
          message: 'Admin with this email already exists'
        };
        res.status(409).json(response);
        return;
      }

      // Force role to ADMIN (cannot be overridden)
      const adminDataWithRole: CreateAdminData = {
        ...adminData,
        role: AdminRole.SUPER_ADMIN
      };

      const admin = await this.adminRepository.createAdmin(adminDataWithRole, createdBy);
      
      const response: ApiResponse = {
        success: true,
        message: 'Admin created successfully',
        data: admin
      };

      res.status(201).json(response);
    } catch (error) {
      console.error('Create admin error:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to create admin',
        ...(error instanceof Error && { errors: [error.message] })
      };
      res.status(500).json(response);
    }
  };

  /**
   * Get Marketing Funnel stats (counts by howDidYouHearAboutUs)
   */
  public getMarketingFunnelStats = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      // Aggregate counts by howDidYouHearAboutUs
      const raw = await User.aggregate([
        {
          $group: {
            _id: {
              $ifNull: ['$howDidYouHearAboutUs', HowDidYouHearAboutUs.OTHER]
            },
            count: { $sum: 1 }
          }
        }
      ]);

      const labels: Record<HowDidYouHearAboutUs, string> = {
        [HowDidYouHearAboutUs.WHATSAPP]: 'Whatsapp',
        [HowDidYouHearAboutUs.TWITTER]: 'Twitter',
        [HowDidYouHearAboutUs.INSTAGRAM]: 'Instagram',
        [HowDidYouHearAboutUs.LINKEDIN]: 'Linkedin',
        [HowDidYouHearAboutUs.FACEBOOK]: 'Facebook',
        [HowDidYouHearAboutUs.GOOGLE_SEARCH]: 'Google Search',
        [HowDidYouHearAboutUs.FRIEND_REFERRAL]: 'Friend/Referral',
        [HowDidYouHearAboutUs.EVENT_CONFERENCE]: 'Event/ Conference',
        [HowDidYouHearAboutUs.BLOG_ARTICLE]: 'Blog/ Article',
        [HowDidYouHearAboutUs.OTHER]: 'Other'
      };

      const countsMap = new Map<string, number>();
      raw.forEach((r: any) => countsMap.set(r._id, r.count));

      const orderedValues = [
        HowDidYouHearAboutUs.WHATSAPP,
        HowDidYouHearAboutUs.FRIEND_REFERRAL,
        HowDidYouHearAboutUs.FACEBOOK,
        HowDidYouHearAboutUs.LINKEDIN,
        HowDidYouHearAboutUs.TWITTER,
        HowDidYouHearAboutUs.INSTAGRAM,
        HowDidYouHearAboutUs.GOOGLE_SEARCH,
        HowDidYouHearAboutUs.EVENT_CONFERENCE,
        HowDidYouHearAboutUs.BLOG_ARTICLE,
        HowDidYouHearAboutUs.OTHER
      ] as HowDidYouHearAboutUs[];

      const data = orderedValues.map(value => ({
        value,
        label: labels[value],
        count: countsMap.get(value) || 0
      }));

      const response: ApiResponse = {
        success: true,
        message: 'Marketing funnel stats retrieved successfully',
        data
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Get marketing funnel stats error:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to retrieve marketing funnel stats',
        ...(error instanceof Error && { errors: [error.message] })
      };
      res.status(500).json(response);
    }
  };

  /**
   * Get all admins with pagination
   */
  public getAllAdmins = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { page = 1, limit = 10, role, status } = req.query;
      const filters: any = {};
      
      if (role) filters.role = role;
      if (status) filters.status = status;

      const result = await this.adminRepository.getAdminsWithPagination(
        Number(page), 
        Number(limit), 
        filters
      );
      
      const response: ApiResponse = {
        success: true,
        message: 'Admins retrieved successfully',
        data: result
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Get all admins error:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to retrieve admins',
        ...(error instanceof Error && { errors: [error.message] })
      };
      res.status(500).json(response);
    }
  };

  /**
   * Get admin by ID
   */
  public getAdminById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      if (!id) {
        const response: ApiResponse = {
          success: false,
          message: 'Admin ID is required'
        };
        res.status(400).json(response);
        return;
      }
      const admin = await this.adminRepository.findById(id);

      if (!admin) {
        const response: ApiResponse = {
          success: false,
          message: 'Admin not found'
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse = {
        success: true,
        message: 'Admin retrieved successfully',
        data: admin
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Get admin by ID error:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to retrieve admin',
        ...(error instanceof Error && { errors: [error.message] })
      };
      res.status(500).json(response);
    }
  };

  /**
   * Update admin
   */
  public updateAdmin = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const updateData: UpdateAdminData = req.body;
      const modifiedBy = req.user?.id;

      if (!id) {
        const response: ApiResponse = {
          success: false,
          message: 'Admin ID is required'
        };
        res.status(400).json(response);
        return;
      }

      const admin = await this.adminRepository.updateAdmin(id, updateData, modifiedBy);

      if (!admin) {
        const response: ApiResponse = {
          success: false,
          message: 'Admin not found'
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse = {
        success: true,
        message: 'Admin updated successfully',
        data: admin
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Update admin error:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to update admin',
        ...(error instanceof Error && { errors: [error.message] })
      };
      res.status(500).json(response);
    }
  };

  /**
   * Update admin status
   */
  public updateAdminStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const modifiedBy = req.user?.id;

      if (!id) {
        const response: ApiResponse = {
          success: false,
          message: 'Admin ID is required'
        };
        res.status(400).json(response);
        return;
      }

      const admin = await this.adminRepository.updateStatus(id, status, modifiedBy);

      if (!admin) {
        const response: ApiResponse = {
          success: false,
          message: 'Admin not found'
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse = {
        success: true,
        message: 'Admin status updated successfully',
        data: admin
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Update admin status error:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to update admin status',
        ...(error instanceof Error && { errors: [error.message] })
      };
      res.status(500).json(response);
    }
  };

  /**
   * Update admin permissions
   */
  public updateAdminPermissions = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { permissions } = req.body;
      const modifiedBy = req.user?.id;

      if (!id) {
        const response: ApiResponse = {
          success: false,
          message: 'Admin ID is required'
        };
        res.status(400).json(response);
        return;
      }

      const admin = await this.adminRepository.updatePermissions(id, permissions, modifiedBy);

      if (!admin) {
        const response: ApiResponse = {
          success: false,
          message: 'Admin not found'
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse = {
        success: true,
        message: 'Admin permissions updated successfully',
        data: admin
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Update admin permissions error:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to update admin permissions',
        ...(error instanceof Error && { errors: [error.message] })
      };
      res.status(500).json(response);
    }
  };

  /**
   * Delete admin
   */
  public deleteAdmin = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      // Prevent self-deletion
      if (req.user?.id === id) {
        const response: ApiResponse = {
          success: false,
          message: 'You cannot delete your own account'
        };
        res.status(400).json(response);
        return;
      }

      if (!id) {
        const response: ApiResponse = {
          success: false,
          message: 'Admin ID is required'
        };
        res.status(400).json(response);
        return;
      }

      const admin = await this.adminRepository.deleteById(id);

      if (!admin) {
        const response: ApiResponse = {
          success: false,
          message: 'Admin not found'
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse = {
        success: true,
        message: 'Admin deleted successfully'
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Delete admin error:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to delete admin',
        ...(error instanceof Error && { errors: [error.message] })
      };
      res.status(500).json(response);
    }
  };

  /**
   * Search admins
   */
  public searchAdmins = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { searchTerm, limit = 10 } = req.query;
      const admins = await this.adminRepository.searchAdmins(
        searchTerm as string, 
        Number(limit)
      );
      
      const response: ApiResponse = {
        success: true,
        message: 'Admins search completed',
        data: admins
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Search admins error:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to search admins',
        ...(error instanceof Error && { errors: [error.message] })
      };
      res.status(500).json(response);
    }
  };

  /**
   * Get admin statistics
   */
  public getAdminStats = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const stats = await this.adminRepository.getStats();
      
      const response: ApiResponse = {
        success: true,
        message: 'Admin statistics retrieved successfully',
        data: stats
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Get admin stats error:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to retrieve admin statistics',
        ...(error instanceof Error && { errors: [error.message] })
      };
      res.status(500).json(response);
    }
  };

  /**
   * Get admins by role
   */
  public getAdminsByRole = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { role } = req.params;
      const admins = await this.adminRepository.findByRole(role as AdminRole);
      
      const response: ApiResponse = {
        success: true,
        message: 'Admins retrieved successfully',
        data: admins
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Get admins by role error:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to retrieve admins by role',
        ...(error instanceof Error && { errors: [error.message] })
      };
      res.status(500).json(response);
    }
  };

  /**
   * Get admins by permission
   */
  public getAdminsByPermission = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { permission } = req.params;
      const admins = await this.adminRepository.findByPermission(permission as AdminPermission);
      
      const response: ApiResponse = {
        success: true,
        message: 'Admins retrieved successfully',
        data: admins
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Get admins by permission error:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to retrieve admins by permission',
        ...(error instanceof Error && { errors: [error.message] })
      };
      res.status(500).json(response);
    }
  };
}
