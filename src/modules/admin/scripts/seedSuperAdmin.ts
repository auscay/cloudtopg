import { AdminRepository } from '../repositories/AdminRepository';
import { AdminRole, AdminPermission, CreateAdminData } from '../../../types';

/**
 * Seed script to create the first super admin
 * Run this script to create the initial super admin account
 */
export class SeedSuperAdmin {
  private adminRepository: AdminRepository;

  constructor() {
    this.adminRepository = new AdminRepository();
  }

  /**
   * Create super admin with default credentials
   */
  async createSuperAdmin(): Promise<void> {
    try {
      // Check if super admin already exists
      const existingSuperAdmin = await this.adminRepository.findByRole(AdminRole.SUPER_ADMIN);
      
      if (existingSuperAdmin.length > 0) {
        console.log('Super admin already exists. Skipping creation.');
        return;
      }

      const superAdminData: CreateAdminData = {
        firstName: 'Super',
        lastName: 'Admin',
        email: 'auscaydev@gmail.com',
        password: 'SuperAdmin123!@#',
        role: AdminRole.SUPER_ADMIN,
        permissions: [
          AdminPermission.MANAGE_USERS,
          AdminPermission.VIEW_USERS,
          AdminPermission.DELETE_USERS,
          AdminPermission.MANAGE_SUBSCRIPTIONS,
          AdminPermission.VIEW_SUBSCRIPTIONS,
          AdminPermission.MANAGE_APPLICATION_FEES,
          AdminPermission.VIEW_APPLICATION_FEES,
          AdminPermission.MANAGE_SYSTEM_SETTINGS,
          AdminPermission.VIEW_SYSTEM_LOGS,
          AdminPermission.MANAGE_ADMINS,
          AdminPermission.MANAGE_CONTENT,
          AdminPermission.VIEW_ANALYTICS
        ],
        phoneNumber: '+1234567890'
      };

      const superAdmin = await this.adminRepository.createAdmin(superAdminData);
      
      console.log('✅ Super admin created successfully!');
      console.log('📧 Email:', superAdmin.email);
      console.log('🔑 Password: SuperAdmin123!@#');
      console.log('⚠️  Please change the password after first login!');
      console.log('🆔 Admin ID:', superAdmin._id);
      
    } catch (error) {
      console.error('❌ Failed to create super admin:', error);
      throw error;
    }
  }

  /**
   * Create super admin with custom credentials
   */
  async createCustomSuperAdmin(
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    phoneNumber?: string
  ): Promise<void> {
    try {
      // Check if admin with email already exists
      const existingAdmin = await this.adminRepository.findByEmail(email);
      
      if (existingAdmin) {
        throw new Error('Admin with this email already exists');
      }

      const superAdminData: CreateAdminData = {
        firstName,
        lastName,
        email,
        password,
        role: AdminRole.SUPER_ADMIN,
        permissions: [
          AdminPermission.MANAGE_USERS,
          AdminPermission.VIEW_USERS,
          AdminPermission.DELETE_USERS,
          AdminPermission.MANAGE_SUBSCRIPTIONS,
          AdminPermission.VIEW_SUBSCRIPTIONS,
          AdminPermission.MANAGE_APPLICATION_FEES,
          AdminPermission.VIEW_APPLICATION_FEES,
          AdminPermission.MANAGE_SYSTEM_SETTINGS,
          AdminPermission.VIEW_SYSTEM_LOGS,
          AdminPermission.MANAGE_ADMINS,
          AdminPermission.MANAGE_CONTENT,
          AdminPermission.VIEW_ANALYTICS
        ],
        ...(phoneNumber && { phoneNumber })
      };

      const superAdmin = await this.adminRepository.createAdmin(superAdminData);
      
      console.log('✅ Custom super admin created successfully!');
      console.log('📧 Email:', superAdmin.email);
      console.log('🆔 Admin ID:', superAdmin._id);
      
    } catch (error) {
      console.error('❌ Failed to create custom super admin:', error);
      throw error;
    }
  }

  /**
   * Create additional admin roles for testing
   */
  async createTestAdmins(): Promise<void> {
    try {
      const testAdmins = [
        {
          firstName: 'Regular',
          lastName: 'Admin',
          email: 'admin@cloudtopg.com',
          password: 'Admin123!@#',
          role: AdminRole.ADMIN,
          phoneNumber: '+1234567891'
        },
        {
          firstName: 'Content',
          lastName: 'Moderator',
          email: 'moderator@cloudtopg.com',
          password: 'Moderator123!@#',
          role: AdminRole.MODERATOR,
          phoneNumber: '+1234567892'
        }
      ];

      for (const adminData of testAdmins) {
        // Check if admin already exists
        const existingAdmin = await this.adminRepository.findByEmail(adminData.email);
        
        if (existingAdmin) {
          console.log(`Admin with email ${adminData.email} already exists. Skipping.`);
          continue;
        }

        const admin = await this.adminRepository.createAdmin(adminData);
        console.log(`✅ ${adminData.role} created: ${admin.email}`);
      }
      
    } catch (error) {
      console.error('❌ Failed to create test admins:', error);
      throw error;
    }
  }
}

// Export function to run the seed script
export async function runSeedSuperAdmin(): Promise<void> {
  const seeder = new SeedSuperAdmin();
  await seeder.createSuperAdmin();
}

// Export function to run with custom credentials
export async function runSeedCustomSuperAdmin(
  firstName: string,
  lastName: string,
  email: string,
  password: string,
  phoneNumber?: string
): Promise<void> {
  const seeder = new SeedSuperAdmin();
  await seeder.createCustomSuperAdmin(firstName, lastName, email, password, phoneNumber);
}

// Export function to create test admins
export async function runSeedTestAdmins(): Promise<void> {
  const seeder = new SeedSuperAdmin();
  await seeder.createTestAdmins();
}
