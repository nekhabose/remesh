import type { AnyZodObject } from 'zod';
import { ZodError } from 'zod';
import type { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/api-error.js';

export function validateBody(schema: AnyZodObject) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      res.locals.validatedBody = schema.parse(req.body);
      next();
    } catch (err) {
      next(toValidationError(err));
    }
  };
}

export function validateParams(schema: AnyZodObject) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      res.locals.validatedParams = schema.parse(req.params);
      next();
    } catch (err) {
      next(toValidationError(err));
    }
  };
}

export function validateQuery(schema: AnyZodObject) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      res.locals.validatedQuery = schema.parse(req.query);
      next();
    } catch (err) {
      next(toValidationError(err));
    }
  };
}

function toValidationError(err: unknown) {
  if (err instanceof ZodError) {
    const details: Record<string, string> = {};

    for (const issue of err.issues) {
      const key = issue.path.join('.') || 'request';
      details[key] = issue.message;
    }

    return new ApiError(400, 'VALIDATION_ERROR', 'Invalid request', details);
  }

  return err;
}
