import { Request, Response, NextFunction } from 'express';
import { createErrorResponse, SystemMessageCode } from '@platform/contracts';

/**
 * Standard Express error handler middleware
 */
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  // If headers already sent, delegate to default Express error handler
  if (res.headersSent) {
    return next(err);
  }

  // Log error in non-production
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.error(`[Error] ${req.method} ${req.path}`, err);
  }

  const statusCode = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  const code = err.code || SystemMessageCode.INTERNAL_SERVER_ERROR;
  const details = process.env.NODE_ENV !== 'production' ? err.details || err.stack : undefined;

  const response = createErrorResponse(
    message,
    code,
    statusCode,
    details,
    req.id
  );

  return res.status(statusCode).json(response);
};
