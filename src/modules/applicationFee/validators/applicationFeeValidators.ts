import Joi from 'joi';

// Initiate payment validation schema
export const initiatePaymentSchema = Joi.object({
  metadata: Joi.object().optional()
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

