import { Prisma } from '@prisma/client';
import type { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/api-error.js';

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ApiError || isApiErrorLike(err)) {
    return res.status(err.status).json({
      error: {
        code: err.code,
        message: err.message,
        details: err.details ?? null
      }
    });
  }

  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json({
      error: {
        code: 'BAD_REQUEST',
        message: 'Malformed JSON body',
        details: null
      }
    });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    return res.status(500).json({
      error: {
        code: 'DATABASE_ERROR',
        message: 'Database request failed',
        details: null
      }
    });
  }

  return res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Internal server error',
      details: null
    }
  });
}

function isApiErrorLike(err: unknown): err is ApiError {
  if (!err || typeof err !== 'object') {
    return false;
  }

  return 'status' in err && 'code' in err && 'message' in err;
}
