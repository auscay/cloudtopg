import { Document, Types } from 'mongoose';

export enum AdminRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  MODERATOR = 'moderator'
}

export enum AdminStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended'
}

export enum AdminPermission {
  // User Management
  MANAGE_USERS = 'manage_users',
  VIEW_USERS = 'view_users',
  DELETE_USERS = 'delete_users',
  
  // Subscription Management
  MANAGE_SUBSCRIPTIONS = 'manage_subscriptions',
  VIEW_SUBSCRIPTIONS = 'view_subscriptions',
  
  // Application Fee Management
  MANAGE_APPLICATION_FEES = 'manage_application_fees',
  VIEW_APPLICATION_FEES = 'view_application_fees',
  
  // System Management
  MANAGE_SYSTEM_SETTINGS = 'manage_system_settings',
  VIEW_SYSTEM_LOGS = 'view_system_logs',
  MANAGE_ADMINS = 'manage_admins',
  
  // Content Management
  MANAGE_CONTENT = 'manage_content',
  VIEW_ANALYTICS = 'view_analytics'
}

export interface IAdmin extends Document {
  _id: Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: AdminRole;
  status: AdminStatus;
  permissions: AdminPermission[];
  phoneNumber?: string;
  profilePicture?: string;
  isEmailVerified: boolean;
  emailVerificationToken?: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  lastLogin?: Date;
  refreshTokens: string[];
  createdBy?: Types.ObjectId; // Reference to admin who created this admin
  lastModifiedBy?: Types.ObjectId; // Reference to admin who last modified this admin
  createdAt: Date;
  updatedAt: Date;
  
  // Methods
  comparePassword(candidatePassword: string): Promise<boolean>;
  generateRefreshToken(): string;
  removeRefreshToken(token: string): void;
  hasPermission(permission: AdminPermission): boolean;
  toJSON(): Partial<IAdmin>;
}

export interface CreateAdminData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: AdminRole;
  permissions?: AdminPermission[];
  phoneNumber?: string;
  profilePicture?: string;
}

export interface UpdateAdminData {
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: AdminRole;
  permissions?: AdminPermission[];
  status?: AdminStatus;
  phoneNumber?: string;
  profilePicture?: string;
}

export interface AdminLoginCredentials {
  email: string;
  password: string;
}

export interface AdminResponse {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: AdminRole;
  status: AdminStatus;
  permissions: AdminPermission[];
  phoneNumber?: string;
  profilePicture?: string;
  isEmailVerified: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminStats {
  totalAdmins: number;
  activeAdmins: number;
  inactiveAdmins: number;
  suspendedAdmins: number;
  superAdmins: number;
  regularAdmins: number;
  moderators: number;
}

// Default permissions for each admin role
export const DEFAULT_ADMIN_PERMISSIONS: Record<AdminRole, AdminPermission[]> = {
  [AdminRole.SUPER_ADMIN]: [
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
  [AdminRole.ADMIN]: [
    AdminPermission.MANAGE_USERS,
    AdminPermission.VIEW_USERS,
    AdminPermission.MANAGE_SUBSCRIPTIONS,
    AdminPermission.VIEW_SUBSCRIPTIONS,
    AdminPermission.MANAGE_APPLICATION_FEES,
    AdminPermission.VIEW_APPLICATION_FEES,
    AdminPermission.VIEW_SYSTEM_LOGS,
    AdminPermission.MANAGE_CONTENT,
    AdminPermission.VIEW_ANALYTICS
  ],
  [AdminRole.MODERATOR]: [
    AdminPermission.VIEW_USERS,
    AdminPermission.VIEW_SUBSCRIPTIONS,
    AdminPermission.VIEW_APPLICATION_FEES,
    AdminPermission.MANAGE_CONTENT
  ]
};
