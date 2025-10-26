import { AdminRepository } from '../repositories/AdminRepository';
import { 
  IAdmin, 
  CreateAdminData, 
  UpdateAdminData, 
  AdminRole, 
  AdminStatus, 
  AdminPermission,
  AdminStats 
} from '../../../types';
import { Types } from 'mongoose';

export class AdminService {
  private adminRepository: AdminRepository;

  constructor() {
    this.adminRepository = new AdminRepository();
  }

  /**
   * Create a new admin
   */
  async createAdmin(adminData: CreateAdminData, createdBy?: string | Types.ObjectId): Promise<IAdmin> {
    // Check if admin with email already exists
    const existingAdmin = await this.adminRepository.findByEmail(adminData.email);
    if (existingAdmin) {
      throw new Error('Admin with this email already exists');
    }

    return await this.adminRepository.createAdmin(adminData, createdBy);
  }

  /**
   * Get admin by ID
   */
  async getAdminById(id: string | Types.ObjectId): Promise<IAdmin | null> {
    return await this.adminRepository.findById(id);
  }

  /**
   * Get admin by email
   */
  async getAdminByEmail(email: string): Promise<IAdmin | null> {
    return await this.adminRepository.findByEmail(email);
  }

  /**
   * Get all admins with pagination
   */
  async getAllAdmins(
    page: number = 1, 
    limit: number = 10, 
    filters: any = {}
  ): Promise<{ admins: IAdmin[]; total: number; pages: number }> {
    return await this.adminRepository.getAdminsWithPagination(page, limit, filters);
  }

  /**
   * Update admin
   */
  async updateAdmin(
    id: string | Types.ObjectId, 
    updateData: UpdateAdminData, 
    modifiedBy?: string | Types.ObjectId
  ): Promise<IAdmin | null> {
    return await this.adminRepository.updateAdmin(id, updateData, modifiedBy);
  }

  /**
   * Update admin status
   */
  async updateAdminStatus(
    id: string | Types.ObjectId, 
    status: AdminStatus, 
    modifiedBy?: string | Types.ObjectId
  ): Promise<IAdmin | null> {
    return await this.adminRepository.updateStatus(id, status, modifiedBy);
  }

  /**
   * Update admin permissions
   */
  async updateAdminPermissions(
    id: string | Types.ObjectId, 
    permissions: AdminPermission[], 
    modifiedBy?: string | Types.ObjectId
  ): Promise<IAdmin | null> {
    return await this.adminRepository.updatePermissions(id, permissions, modifiedBy);
  }

  /**
   * Delete admin
   */
  async deleteAdmin(id: string | Types.ObjectId): Promise<IAdmin | null> {
    return await this.adminRepository.deleteById(id);
  }

  /**
   * Search admins
   */
  async searchAdmins(searchTerm: string, limit: number = 10): Promise<IAdmin[]> {
    return await this.adminRepository.searchAdmins(searchTerm, limit);
  }

  /**
   * Get admin statistics
   */
  async getAdminStats(): Promise<AdminStats> {
    return await this.adminRepository.getStats();
  }

  /**
   * Get admins by role
   */
  async getAdminsByRole(role: AdminRole): Promise<IAdmin[]> {
    return await this.adminRepository.findByRole(role);
  }

  /**
   * Get admins by permission
   */
  async getAdminsByPermission(permission: AdminPermission): Promise<IAdmin[]> {
    return await this.adminRepository.findByPermission(permission);
  }

  /**
   * Verify admin password
   */
  async verifyAdminPassword(admin: IAdmin, password: string): Promise<boolean> {
    return await admin.comparePassword(password);
  }

  /**
   * Update admin last login
   */
  async updateLastLogin(id: string | Types.ObjectId): Promise<IAdmin | null> {
    return await this.adminRepository.updateLastLogin(id);
  }

  /**
   * Add refresh token to admin
   */
  async addRefreshToken(id: string | Types.ObjectId, token: string): Promise<IAdmin | null> {
    return await this.adminRepository.addRefreshToken(id, token);
  }

  /**
   * Remove refresh token from admin
   */
  async removeRefreshToken(id: string | Types.ObjectId, token: string): Promise<IAdmin | null> {
    return await this.adminRepository.removeRefreshToken(id, token);
  }

  /**
   * Clear all refresh tokens for admin
   */
  async clearRefreshTokens(id: string | Types.ObjectId): Promise<IAdmin | null> {
    return await this.adminRepository.clearRefreshTokens(id);
  }

  /**
   * Check if admin has specific permission
   */
  hasPermission(admin: IAdmin, permission: AdminPermission): boolean {
    return admin.hasPermission(permission);
  }

  /**
   * Check if admin can manage another admin
   */
  canManageAdmin(manager: IAdmin, target: IAdmin): boolean {
    // Super admin can manage everyone
    if (manager.role === AdminRole.SUPER_ADMIN) {
      return true;
    }

    // Admin can manage moderators
    if (manager.role === AdminRole.ADMIN && target.role === AdminRole.MODERATOR) {
      return true;
    }

    // No one can manage super admins except other super admins
    if (target.role === AdminRole.SUPER_ADMIN) {
      return false;
    }

    return false;
  }

  /**
   * Get admins created by specific admin
   */
  async getAdminsCreatedBy(createdBy: string | Types.ObjectId): Promise<IAdmin[]> {
    return await this.adminRepository.findByCreatedBy(createdBy);
  }

  /**
   * Activate admin
   */
  async activateAdmin(
    id: string | Types.ObjectId, 
    modifiedBy?: string | Types.ObjectId
  ): Promise<IAdmin | null> {
    return await this.updateAdminStatus(id, AdminStatus.ACTIVE, modifiedBy);
  }

  /**
   * Deactivate admin
   */
  async deactivateAdmin(
    id: string | Types.ObjectId, 
    modifiedBy?: string | Types.ObjectId
  ): Promise<IAdmin | null> {
    return await this.updateAdminStatus(id, AdminStatus.INACTIVE, modifiedBy);
  }

  /**
   * Suspend admin
   */
  async suspendAdmin(
    id: string | Types.ObjectId, 
    modifiedBy?: string | Types.ObjectId
  ): Promise<IAdmin | null> {
    return await this.updateAdminStatus(id, AdminStatus.SUSPENDED, modifiedBy);
  }

  /**
   * Bulk update admin status
   */
  async bulkUpdateAdminStatus(
    adminIds: string[], 
    status: AdminStatus, 
    modifiedBy?: string | Types.ObjectId
  ): Promise<{ successCount: number; failedCount: number; errors: string[] }> {
    let successCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    for (const id of adminIds) {
      try {
        await this.updateAdminStatus(id, status, modifiedBy);
        successCount++;
      } catch (error) {
        failedCount++;
        errors.push(`Failed to update admin ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return { successCount, failedCount, errors };
  }
}
