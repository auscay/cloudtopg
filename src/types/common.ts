import { Request, Response } from 'express';
import { IUser } from './user';

export interface AuthenticatedRequest extends Request {
  user?: IUser;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

export interface ApiError extends Error {
  statusCode: number;
  isOperational: boolean;
}

export type ControllerFunction = (
  req: AuthenticatedRequest,
  res: Response
) => Promise<void>;

export type MiddlewareFunction = (
  req: AuthenticatedRequest,
  res: Response,
  next: Function
) => Promise<void> | void;
