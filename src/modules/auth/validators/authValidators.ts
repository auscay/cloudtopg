import Joi from 'joi';
import { UserRole } from '../../../types';

// Common validation schemas
const emailSchema = Joi.string()
  .email({ tlds: { allow: false } })
  .lowercase()
  .trim()
  .required()
  .messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required'
  });

const passwordSchema = Joi.string()
  .min(8)
  .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
  .required()
  .messages({
    'string.min': 'Password must be at least 8 characters long',
    'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    'any.required': 'Password is required'
  });

const nameSchema = Joi.string()
  .min(2)
  .max(50)
  .trim()
  .pattern(/^[a-zA-Z\s'-]+$/)
  .required()
  .messages({
    'string.min': 'Name must be at least 2 characters long',
    'string.max': 'Name cannot exceed 50 characters',
    'string.pattern.base': 'Name can only contain letters, spaces, hyphens, and apostrophes',
    'any.required': 'Name is required'
  });

// Registration validation schema
export const registerSchema = Joi.object({
  firstName: nameSchema,
  lastName: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: Joi.string()
    .valid(Joi.ref('password'))
    .required()
    .messages({
      'any.only': 'Passwords do not match',
      'any.required': 'Password confirmation is required'
    }),
  role: Joi.string()
    .valid(...Object.values(UserRole))
    .default(UserRole.STUDENT)
    .messages({
      'any.only': `Role must be one of: ${Object.values(UserRole).join(', ')}`
    })
});

// Login validation schema
export const loginSchema = Joi.object({
  email: emailSchema,
  password: Joi.string().required().messages({
    'any.required': 'Password is required'
  })
});

// Change password validation schema
export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required().messages({
    'any.required': 'Current password is required'
  }),
  newPassword: passwordSchema,
  confirmNewPassword: Joi.string()
    .valid(Joi.ref('newPassword'))
    .required()
    .messages({
      'any.only': 'New passwords do not match',
      'any.required': 'Password confirmation is required'
    })
});

// Refresh token validation schema
export const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required().messages({
    'any.required': 'Refresh token is required'
  })
});

// Email verification validation schema
export const emailVerificationSchema = Joi.object({
  token: Joi.string().required().messages({
    'any.required': 'Verification token is required'
  })
});

// Forgot password validation schema
export const forgotPasswordSchema = Joi.object({
  email: emailSchema
});

// Reset password validation schema
export const resetPasswordSchema = Joi.object({
  token: Joi.string().required().messages({
    'any.required': 'Reset token is required'
  }),
  newPassword: passwordSchema,
  confirmNewPassword: Joi.string()
    .valid(Joi.ref('newPassword'))
    .required()
    .messages({
      'any.only': 'Passwords do not match',
      'any.required': 'Password confirmation is required'
    })
});

// Resend verification validation schema
export const resendVerificationSchema = Joi.object({
  email: emailSchema
});
