export interface ApiResponse<T = any> {
  success: boolean;
  /**
   * HTTP Status code for quick reference in client logic
   */
  statusCode: number;
  message?: string;
  data?: T;
  error?: ApiError;
  meta: ApiMeta;
}

export interface ApiError {
  code: string; // Machine readable error code e.g. 'VALIDATION_ERROR'
  message: string; // Human readable message
  details?: unknown; // Stack trace or validation errors (dev only usually)
}

export interface ApiMeta {
  requestId: string;
  timestamp: string;
  page?: number;
  limit?: number;
  total?: number;
  [key: string]: unknown;
}

// Standard Error Codes
export enum ErrorCode {
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  BAD_REQUEST = 'BAD_REQUEST',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
}

// Builders
export const createSuccessResponse = <T>(
    data: T, 
    message: string = 'Success', 
    statusCode: number = 200, 
    meta: Partial<ApiMeta> = {}
): ApiResponse<T> => ({
  success: true,
  statusCode,
  message,
  data,
  meta: {
    timestamp: new Date().toISOString(),
    requestId: meta.requestId || 'unknown-request-id',
    ...meta
  },
});

export const createErrorResponse = (
    message: string, 
    code: string = ErrorCode.INTERNAL_SERVER_ERROR, 
    statusCode: number = 500, 
    details?: unknown,
    requestId: string = 'unknown-request-id'
): ApiResponse<null> => ({
  success: false,
  statusCode,
  data: undefined,
  error: {
    code,
    message,
    details,
  },
  meta: {
    timestamp: new Date().toISOString(),
    requestId,
  },
});
