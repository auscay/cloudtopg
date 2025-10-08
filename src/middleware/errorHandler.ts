import { Request, Response, NextFunction } from 'express';
import { config } from '../config';
import { ApiResponse, ApiError } from '../types';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { ValidationError } from 'joi';
import { MongoError } from 'mongodb';

export class ErrorHandler {
  /**
   * Handle all errors
   */
  public static handleError = (error: Error, req: Request, res: Response, next: NextFunction): void => {
    console.error('Error occurred:', {
      message: error.message,
      stack: error.stack,
      url: req.url,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    let statusCode = 500;
    let message = 'Internal server error';
    let errors: string[] = [];

    // Handle different error types
    if ('statusCode' in error && 'isOperational' in error) {
      statusCode = (error as ApiError).statusCode;
      message = error.message;
    } else if (error instanceof JsonWebTokenError) {
      statusCode = 401;
      message = 'Invalid token';
      errors = [error.message];
    } else if (error instanceof TokenExpiredError) {
      statusCode = 401;
      message = 'Token expired';
      errors = [error.message];
    } else if (error instanceof ValidationError) {
      statusCode = 400;
      message = 'Validation failed';
      errors = error.details.map(detail => detail.message);
    } else if (error instanceof MongoError) {
      statusCode = 400;
      message = 'Database error';
      
      if (error.code === 11000) {
        // Duplicate key error
        message = 'Duplicate entry';
        const field = Object.keys((error as any).keyPattern)[0];
        errors = [`${field} already exists`];
      } else {
        errors = [error.message];
      }
    } else if (error.name === 'CastError') {
      statusCode = 400;
      message = 'Invalid ID format';
      errors = ['The provided ID is not valid'];
    } else if (error.name === 'ValidationError') {
      statusCode = 400;
      message = 'Validation failed';
      errors = Object.values((error as any).errors).map((err: any) => err.message);
    }

    const response: ApiResponse = {
      success: false,
      message,
      ...(errors.length > 0 && { errors })
    };

    // Include stack trace in development
    if (config.nodeEnv === 'development') {
      (response as any).stack = error.stack;
    }

    res.status(statusCode).json(response);
  };

  /**
   * Handle 404 errors
   */
  public static handleNotFound = (req: Request, res: Response): void => {
    const response: ApiResponse = {
      success: false,
      message: `Route ${req.method} ${req.path} not found`
    };

    res.status(404).json(response);
  };

  /**
   * Handle async errors
   */
  public static asyncHandler = (fn: Function) => {
    return (req: Request, res: Response, next: NextFunction): void => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  };

  /**
   * Create custom API error
   */
  public static createError = (message: string, statusCode: number = 500, isOperational: boolean = true): ApiError => {
    const error = new Error(message) as ApiError;
    error.statusCode = statusCode;
    error.isOperational = isOperational;
    return error;
  };

  /**
   * Handle unhandled promise rejections
   */
  public static handleUnhandledRejection = (): void => {
    process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
      console.error('Unhandled Rejection at:', promise, 'reason:', reason);
      
      // Close server & exit process
      process.exit(1);
    });
  };

  /**
   * Handle uncaught exceptions
   */
  public static handleUncaughtException = (): void => {
    process.on('uncaughtException', (error: Error) => {
      console.error('Uncaught Exception:', error);
      
      // Close server & exit process
      process.exit(1);
    });
  };

  /**
   * Handle SIGTERM signal
   */
  public static handleSigterm = (): void => {
    process.on('SIGTERM', () => {
      console.log('SIGTERM received. Shutting down gracefully...');
      process.exit(0);
    });
  };

  /**
   * Handle SIGINT signal (Ctrl+C)
   */
  public static handleSigint = (): void => {
    process.on('SIGINT', () => {
      console.log('SIGINT received. Shutting down gracefully...');
      process.exit(0);
    });
  };

  /**
   * Initialize error handling
   */
  public static initialize = (): void => {
    this.handleUnhandledRejection();
    this.handleUncaughtException();
    this.handleSigterm();
    this.handleSigint();
  };
}
