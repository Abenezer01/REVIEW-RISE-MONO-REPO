import { Request, Response, NextFunction } from 'express';
import { ZodTypeAny } from 'zod';
import { createErrorResponse } from '@platform/contracts';

export const validateRequest = (schema: ZodTypeAny, source: 'body' | 'query' | 'params' = 'body') => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await schema.safeParseAsync(req[source]);

      if (!result.success) {
        return res.status(400).json(
          createErrorResponse(
            'Validation failed',
            'VALIDATION_ERROR',
            400,
            result.error.issues
          )
        );
      }

      // Update the request with the validated (and transformed) data
      (req as any)[source] = result.data;
      next();
    } catch (error) {
      console.error('Validation middleware error:', error);
      return res.status(500).json(
        createErrorResponse(
          'Internal validation error',
          'INTERNAL_SERVER_ERROR',
          500
        )
      );
    }
  };
};
