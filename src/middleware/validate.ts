import { Request, Response, NextFunction } from 'express';
import { ValidationError } from '../utils/errors';
import { ZodSchema } from 'zod';

export const validateRequest = (schema: ZodSchema) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      console.log('Request body:', req.body);
      const result = await schema.parseAsync(req.body);
      console.log('Validation result:', result);
      req.body = result; // Atualiza o body com o resultado da validação
      next();
    } catch (error) {
      console.error('Validation error:', error);
      if (error.errors) {
        throw new ValidationError(error.errors[0].message);
      }
      next(error);
    }
  };
};