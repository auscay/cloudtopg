import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { ApiResponse } from '../types';

/**
 * Generic validation middleware factory
 */
export const validate = (schema: Joi.ObjectSchema, source: 'body' | 'query' | 'params' = 'body') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const data = req[source];
    
    const { error, value } = schema.validate(data, {
      abortEarly: false, // Get all validation errors
      stripUnknown: true, // Remove unknown fields
      allowUnknown: false // Don't allow unknown fields
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }));

      const response: ApiResponse = {
        success: false,
        message: 'Validation failed',
        errors: errors.map(err => `${err.field}: ${err.message}`)
      };

      res.status(400).json(response);
      return;
    }

    // Replace the original data with validated and sanitized data
    req[source] = value;
    next();
  };
};

/**
 * Validate request body
 */
export const validateBody = (schema: Joi.ObjectSchema) => validate(schema, 'body');

/**
 * Validate query parameters
 */
export const validateQuery = (schema: Joi.ObjectSchema) => validate(schema, 'query');

/**
 * Validate route parameters
 */
export const validateParams = (schema: Joi.ObjectSchema) => validate(schema, 'params');

/**
 * Custom validation for MongoDB ObjectId
 */
export const validateObjectId = (paramName: string = 'id') => {
  const schema = Joi.object({
    [paramName]: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required().messages({
      'string.pattern.base': 'Invalid ID format',
      'any.required': 'ID is required'
    })
  });

  return validateParams(schema);
};

/**
 * Validate file upload
 */
export const validateFileUpload = (options: {
  maxSize?: number;
  allowedTypes?: string[];
  required?: boolean;
} = {}) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { maxSize = 5 * 1024 * 1024, allowedTypes = ['image/jpeg', 'image/png', 'image/gif'], required = false } = options;

    if (required && (!(req as any).file && !(req as any).files)) {
      const response: ApiResponse = {
        success: false,
        message: 'File upload is required',
        errors: ['No file provided']
      };
      res.status(400).json(response);
      return;
    }

    if ((req as any).file) {    
      // Single file validation
      if ((req as any).file.size > maxSize) {
        const response: ApiResponse = {
          success: false,
          message: 'File too large',
          errors: [`File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`]
        };
        res.status(400).json(response);
        return;
      }

      if (!allowedTypes.includes((req as any).file.mimetype)) {
        const response: ApiResponse = {
          success: false,
          message: 'Invalid file type',
          errors: [`File type must be one of: ${allowedTypes.join(', ')}`]
        };
        res.status(400).json(response);
        return;
      }
    }

    if ((req as any).files) {
      // Multiple files validation
      const files = Array.isArray((req as any).files) ? (req as any).files : Object.values((req as any).files).flat();
      
      for (const file of files) {
        if (file.size > maxSize) {
          const response: ApiResponse = {
            success: false,
            message: 'File too large',
            errors: [`File ${file.originalname} size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`]
          };
          res.status(400).json(response);
          return;
        }

        if (!allowedTypes.includes(file.mimetype)) {
          const response: ApiResponse = {
            success: false,
            message: 'Invalid file type',
            errors: [`File ${file.originalname} type must be one of: ${allowedTypes.join(', ')}`]
          };
          res.status(400).json(response);
          return;
        }
      }
    }

    next();
  };
};

/**
 * Validate email format
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 */
export const validatePasswordStrength = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (!/[@$!%*?&]/.test(password)) {
    errors.push('Password must contain at least one special character (@$!%*?&)');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate phone number format
 */
export const validatePhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone);
};

/**
 * Validate URL format
 */
export const validateUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Sanitize input to prevent XSS
 */
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .trim()
    .substring(0, 1000); // Limit length
};
