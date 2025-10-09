import Joi from 'joi';
import { Gender, EmploymentStatus, AcademyLevel } from '../../../types';

const dateOfBirthSchema = Joi.date()
  .max('now')
  .optional()
  .messages({
    'date.max': 'Date of birth must be in the past'
  });

// Update user details validation schema
export const updateUserDetailsSchema = Joi.object({
  gender: Joi.string()
    .valid(...Object.values(Gender))
    .optional()
    .messages({
      'any.only': `Gender must be one of: ${Object.values(Gender).join(', ')}`
    }),
  
  employmentStatus: Joi.string()
    .valid(...Object.values(EmploymentStatus))
    .optional()
    .messages({
      'any.only': `Employment status must be one of: ${Object.values(EmploymentStatus).join(', ')}`
    }),
  
  academyLevel: Joi.string()
    .valid(...Object.values(AcademyLevel))
    .optional()
    .messages({
      'any.only': `Academy level must be one of: ${Object.values(AcademyLevel).join(', ')}`
    }),
  
  dateOfBirth: dateOfBirthSchema,
  
  countryOfResidence: Joi.string()
    .trim()
    .max(100)
    .optional()
    .messages({
      'string.max': 'Country name cannot exceed 100 characters'
    }),
  
  stateOfResidence: Joi.string()
    .trim()
    .max(100)
    .optional()
    .messages({
      'string.max': 'State name cannot exceed 100 characters'
    })
});
