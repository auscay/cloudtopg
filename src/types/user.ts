import { Document, Types } from 'mongoose';

export enum UserRole {
  ADMIN = 'admin',
  TEACHER = 'teacher',
  STUDENT = 'student',
  PARENT = 'parent'
}

export enum UserStatus {
  APPLIED = 'applied',
  ENROLLED = 'enrolled',
  ADMITTED = 'admitted',
  WITHDRAWN = 'withdrawn'
}

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
  PREFER_NOT_TO_SAY = 'prefer_not_to_say'
}

export enum EmploymentStatus {
  EMPLOYED = 'employed',
  UNEMPLOYED = 'unemployed',
  SELF_EMPLOYED = 'self_employed',
  STUDENT = 'student',
  RETIRED = 'retired',
  OTHER = 'other'
}

export enum AcademyLevel {
  HIGH_SCHOOL = 'high_school',
  UNDERGRADUATE = 'undergraduate',
  GRADUATE = 'graduate',
  POSTGRADUATE = 'postgraduate',
  DOCTORATE = 'doctorate',
  PROFESSIONAL = 'professional',
  OTHER = 'other'
}

export enum HowDidYouHearAboutUs {
  WHATSAPP = 'whatsapp',
  TWITTER = 'twitter',
  INSTAGRAM = 'instagram',
  LINKEDIN = 'linkedin',
  FACEBOOK = 'facebook',
  GOOGLE_SEARCH = 'google_search',
  FRIEND_REFERRAL = 'friend_referral',
  EVENT_CONFERENCE = 'event_conference',
  BLOG_ARTICLE = 'blog_article',
  OTHER = 'other'
}

export interface IUser extends Document {
  _id: Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
  status: UserStatus;
  gender?: Gender;
  employmentStatus?: EmploymentStatus;
  academyLevel?: AcademyLevel;
  dateOfBirth?: Date;
  countryOfResidence?: string;
  stateOfResidence?: string;
  howDidYouHearAboutUs?: HowDidYouHearAboutUs;
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
  subscription?: Types.ObjectId | any; // Reference to active subscription
  applicationFeePaid?: boolean; // Whether user has paid application fee
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
  gender?: Gender;
  employmentStatus?: EmploymentStatus;
  academyLevel?: AcademyLevel;
  dateOfBirth?: Date;
  countryOfResidence?: string;
  stateOfResidence?: string;
  howDidYouHearAboutUs?: HowDidYouHearAboutUs;
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
  gender?: Gender;
  employmentStatus?: EmploymentStatus;
  academyLevel?: AcademyLevel;
  dateOfBirth?: Date;
  countryOfResidence?: string;
  stateOfResidence?: string;
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
