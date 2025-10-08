import { Response } from 'express';
import { ApiResponse } from '../types';

export class ResponseHelper {
  /**
   * Send success response
   */
  public static success<T = any>(
    res: Response,
    message: string,
    data?: T,
    statusCode: number = 200
  ): void {
    const response: ApiResponse<T> = {
      success: true,
      message,
      ...(data !== undefined && { data })
    };
    res.status(statusCode).json(response);
  }

  /**
   * Send error response
   */
  public static error(
    res: Response,
    message: string,
    statusCode: number = 500,
    errors?: string[]
  ): void {
    const response: ApiResponse = {
      success: false,
      message,
      ...(errors && { errors })
    };
    res.status(statusCode).json(response);
  }

  /**
   * Send validation error response
   */
  public static validationError(
    res: Response,
    message: string = 'Validation failed',
    errors: string[]
  ): void {
    const response: ApiResponse = {
      success: false,
      message,
      errors
    };
    res.status(400).json(response);
  }

  /**
   * Send not found response
   */
  public static notFound(
    res: Response,
    message: string = 'Resource not found'
  ): void {
    const response: ApiResponse = {
      success: false,
      message
    };
    res.status(404).json(response);
  }

  /**
   * Send unauthorized response
   */
  public static unauthorized(
    res: Response,
    message: string = 'Unauthorized'
  ): void {
    const response: ApiResponse = {
      success: false,
      message
    };
    res.status(401).json(response);
  }

  /**
   * Send forbidden response
   */
  public static forbidden(
    res: Response,
    message: string = 'Forbidden'
  ): void {
    const response: ApiResponse = {
      success: false,
      message
    };
    res.status(403).json(response);
  }

  /**
   * Send created response
   */
  public static created<T = any>(
    res: Response,
    message: string,
    data?: T
  ): void {
    this.success(res, message, data, 201);
  }

  /**
   * Send no content response
   */
  public static noContent(res: Response): void {
    res.status(204).send();
  }
}
