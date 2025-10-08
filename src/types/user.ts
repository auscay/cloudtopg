import { Document, Types } from 'mongoose';

export enum UserRole {
  ADMIN = 'admin',
  TEACHER = 'teacher',
  STUDENT = 'student',
  PARENT = 'parent'
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING = 'pending'
}

export interface IUser extends Document {
  _id: Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
  status: UserStatus;
  dateOfBirth?: Date;
  phoneNumber?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  profilePicture?: string;
  isEmailVerified: boolean;
  emailVerificationToken?: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  lastLogin?: Date;
  refreshTokens: string[];
  createdAt: Date;
  updatedAt: Date;
  
  // Methods
  comparePassword(candidatePassword: string): Promise<boolean>;
  generateRefreshToken(): string;
  removeRefreshToken(token: string): void;
  toJSON(): Partial<IUser>;
}

export interface CreateUserData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
  dateOfBirth?: Date;
  phoneNumber?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  email?: string;
  dateOfBirth?: Date;
  phoneNumber?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  profilePicture?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface UserResponse {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  dateOfBirth?: Date;
  phoneNumber?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  profilePicture?: string;
  isEmailVerified: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}
