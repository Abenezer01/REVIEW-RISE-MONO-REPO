import { Request, Response, NextFunction } from 'express';
import { createErrorResponse, ErrorCode } from '@platform/contracts';

/**
 * Central error handling middleware for Express services
 * Standardizes all errors into the ApiResponse format defined in @platform/contracts
 */
export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) => {
  // eslint-disable-next-line no-console
  console.error(`[Error] ${req.method} ${req.url}:`, err);

  const statusCode = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  const code = err.code || (statusCode === 404 ? ErrorCode.NOT_FOUND : ErrorCode.INTERNAL_SERVER_ERROR);
  const details = process.env.NODE_ENV === 'development' || process.env.DEBUG === 'true' ? err.stack : undefined;
  const requestId = req.id || 'unknown';

  const response = createErrorResponse(
    message,
    code as string,
    statusCode,
    details,
    requestId
  );

  res.status(statusCode).json(response);
};
