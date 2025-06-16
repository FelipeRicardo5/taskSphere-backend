import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { ValidationError } from '../utils/errors';

interface CustomError extends Error {
  statusCode?: number;
  code?: number;
  keyValue?: any;
  errors?: any;
}

export const errorHandler: ErrorRequestHandler = (
  err: CustomError,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  let error = { ...err };
  error.message = err.message;

  // Log error for dev
  console.error('Error details:', {
    name: err.name,
    message: err.message,
    stack: err.stack,
    code: err.code,
    errors: err.errors
  });

  // Validation Error (including authorization)
  if (err instanceof ValidationError) {
    error.statusCode = err.message.includes('authorized') ? 403 : 400;
    return res.status(error.statusCode).json({
      success: false,
      error: error.message
    });
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = new Error(message) as CustomError;
    error.statusCode = 404;
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = new Error(message) as CustomError;
    error.statusCode = 400;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = err.errors ? Object.values(err.errors).map((val: any) => val.message).join(', ') : 'Validation error';
    error = new Error(message) as CustomError;
    error.statusCode = 400;
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error',
    details: process.env.NODE_ENV === 'development' ? err : undefined
  });
}; 