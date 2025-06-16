import { Request, Response, NextFunction } from 'express';
import { ValidationError } from '../utils/errors';
import { ZodSchema } from 'zod';

export const validateRequest = (schema: ZodSchema) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      console.log('Request body:', req.body);
      const result = await schema.parseAsync(req.body);
      console.log('Validation result:', result);
      req.body = result; 
      next();
    } catch (error) {
      console.error('Validation error:', error);
      if (error.errors) {
        next(new ValidationError(error.errors[0].message));
        return;
      }
      next(error);
    }
  };
};