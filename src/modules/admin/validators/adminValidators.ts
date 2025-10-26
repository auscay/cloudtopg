import Joi from 'joi';
import { AdminRole, AdminStatus, AdminPermission } from '../../../types';

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

const profilePictureSchema = Joi.string()
  .uri()
  .optional()
  .messages({
    'string.uri': 'Profile picture must be a valid URL'
  });

// Create admin validation schema
export const createAdminSchema = Joi.object({
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
    .valid(...Object.values(AdminRole))
    .default(AdminRole.ADMIN)
    .messages({
      'any.only': `Role must be one of: ${Object.values(AdminRole).join(', ')}`
    }),
  permissions: Joi.array()
    .items(Joi.string().valid(...Object.values(AdminPermission)))
    .optional()
    .messages({
      'array.items': `Permissions must be one of: ${Object.values(AdminPermission).join(', ')}`
    }),
  profilePicture: profilePictureSchema
});

// Update admin validation schema
export const updateAdminSchema = Joi.object({
  firstName: nameSchema.optional(),
  lastName: nameSchema.optional(),
  email: emailSchema.optional(),
  role: Joi.string()
    .valid(...Object.values(AdminRole))
    .optional()
    .messages({
      'any.only': `Role must be one of: ${Object.values(AdminRole).join(', ')}`
    }),
  status: Joi.string()
    .valid(...Object.values(AdminStatus))
    .optional()
    .messages({
      'any.only': `Status must be one of: ${Object.values(AdminStatus).join(', ')}`
    }),
  permissions: Joi.array()
    .items(Joi.string().valid(...Object.values(AdminPermission)))
    .optional()
    .messages({
      'array.items': `Permissions must be one of: ${Object.values(AdminPermission).join(', ')}`
    }),
  profilePicture: profilePictureSchema
});

// Admin login validation schema
export const adminLoginSchema = Joi.object({
  email: emailSchema,
  password: Joi.string().required().messages({
    'any.required': 'Password is required'
  })
});

// Change admin password validation schema
export const changeAdminPasswordSchema = Joi.object({
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

// Update admin status validation schema
export const updateAdminStatusSchema = Joi.object({
  status: Joi.string()
    .valid(...Object.values(AdminStatus))
    .required()
    .messages({
      'any.only': `Status must be one of: ${Object.values(AdminStatus).join(', ')}`,
      'any.required': 'Status is required'
    })
});

// Update admin permissions validation schema
export const updateAdminPermissionsSchema = Joi.object({
  permissions: Joi.array()
    .items(Joi.string().valid(...Object.values(AdminPermission)))
    .min(1)
    .required()
    .messages({
      'array.min': 'At least one permission is required',
      'array.items': `Permissions must be one of: ${Object.values(AdminPermission).join(', ')}`,
      'any.required': 'Permissions are required'
    })
});

// Admin search validation schema
export const adminSearchSchema = Joi.object({
  searchTerm: Joi.string()
    .min(2)
    .max(100)
    .trim()
    .required()
    .messages({
      'string.min': 'Search term must be at least 2 characters long',
      'string.max': 'Search term cannot exceed 100 characters',
      'any.required': 'Search term is required'
    }),
  limit: Joi.number()
    .integer()
    .min(1)
    .max(50)
    .default(10)
    .optional()
    .messages({
      'number.min': 'Limit must be at least 1',
      'number.max': 'Limit cannot exceed 50'
    })
});

// Admin pagination validation schema
export const adminPaginationSchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .default(1)
    .optional()
    .messages({
      'number.min': 'Page must be at least 1'
    }),
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(10)
    .optional()
    .messages({
      'number.min': 'Limit must be at least 1',
      'number.max': 'Limit cannot exceed 100'
    }),
  role: Joi.string()
    .valid(...Object.values(AdminRole))
    .optional()
    .messages({
      'any.only': `Role must be one of: ${Object.values(AdminRole).join(', ')}`
    }),
  status: Joi.string()
    .valid(...Object.values(AdminStatus))
    .optional()
    .messages({
      'any.only': `Status must be one of: ${Object.values(AdminStatus).join(', ')}`
    })
});

// Admin ID validation schema
export const adminIdSchema = Joi.object({
  id: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'Invalid admin ID format',
      'any.required': 'Admin ID is required'
    })
});

// Bulk admin operations validation schema
export const bulkAdminOperationSchema = Joi.object({
  adminIds: Joi.array()
    .items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/))
    .min(1)
    .max(50)
    .required()
    .messages({
      'array.min': 'At least one admin ID is required',
      'array.max': 'Cannot process more than 50 admins at once',
      'array.items': 'Invalid admin ID format',
      'any.required': 'Admin IDs are required'
    }),
  operation: Joi.string()
    .valid('activate', 'deactivate', 'suspend', 'delete')
    .required()
    .messages({
      'any.only': 'Operation must be one of: activate, deactivate, suspend, delete',
      'any.required': 'Operation is required'
    })
});

// Refresh token validation schema
export const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required().messages({
    'any.required': 'Refresh token is required'
  })
});
