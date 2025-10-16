import Joi from 'joi';
import { PaymentPlanType } from '../../../types';

// Common validation schemas
const mongoIdSchema = Joi.string()
  .pattern(/^[0-9a-fA-F]{24}$/)
  .required()
  .messages({
    'string.pattern.base': 'Invalid ID format',
    'any.required': 'ID is required'
  });

const planTypeSchema = Joi.string()
  .valid(...Object.values(PaymentPlanType))
  .required()
  .messages({
    'any.only': 'Invalid payment plan type. Must be early_bird, mid, or normal',
    'any.required': 'Plan type is required'
  });

const metadataSchema = Joi.object()
  .optional()
  .messages({
    'object.base': 'Metadata must be an object'
  });

// Create subscription validation schema
export const createSubscriptionSchema = Joi.object({
  planType: planTypeSchema,
  metadata: metadataSchema
});

// Make payment validation schema (body)
export const makePaymentSchema = Joi.object({
  metadata: metadataSchema
});

// Make payment validation schema (params)
export const makePaymentParamsSchema = Joi.object({
  subscriptionId: mongoIdSchema
});

// Subscription transactions validation schema (params)
export const subscriptionTransactionsParamsSchema = Joi.object({
  subscriptionId: mongoIdSchema
});

// Verify payment validation schema (query)
export const verifyPaymentQuerySchema = Joi.object({
  reference: Joi.string()
    .required()
    .messages({
      'any.required': 'Payment reference is required',
      'string.base': 'Payment reference must be a string'
    })
});

// Subscription ID validation schema (params)
export const subscriptionIdParamsSchema = Joi.object({
  id: mongoIdSchema
});

// Cancel subscription validation schema (body)
export const cancelSubscriptionSchema = Joi.object({
  reason: Joi.string()
    .max(500)
    .optional()
    .messages({
      'string.base': 'Reason must be a string',
      'string.max': 'Reason cannot exceed 500 characters'
    })
});

// Plan type validation schema (params)
export const planTypeParamsSchema = Joi.object({
  type: planTypeSchema
});

