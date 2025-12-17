// ============================================================================
// Response Types
// ============================================================================

/**
 * Standard API response wrapper
 */
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

/**
 * Paginated API response
 */
export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  meta: ApiMeta & {
    page: number;
    limit: number;
    total: number;
    lastPage?: number;
  };
}

/**
 * API error details
 */
export interface ApiError {
  code: string; // Machine readable error code e.g. 'VALIDATION_ERROR'
  message: string; // Human readable message
  details?: unknown; // Stack trace or validation errors (dev only usually)
  field?: string; // Field name for validation errors
}

/**
 * API response metadata
 */
export interface ApiMeta {
  requestId: string;
  timestamp: string;
  page?: number;
  limit?: number;
  total?: number;
  lastPage?: number;
  [key: string]: unknown;
}

// ============================================================================
// Error Codes
// ============================================================================

export enum ErrorCode {
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  BAD_REQUEST = 'BAD_REQUEST',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  CONFLICT = 'CONFLICT',
  TOO_MANY_REQUESTS = 'TOO_MANY_REQUESTS'
}

// ============================================================================
// Response Builders
// ============================================================================

/**
 * Create a successful API response
 */
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
  }
});

/**
 * Create a paginated success response
 */
export const createPaginatedResponse = <T>(
  data: T[],
  pagination: { page: number; limit: number; total: number },
  message: string = 'Success',
  statusCode: number = 200,
  meta: Partial<ApiMeta> = {}
): PaginatedResponse<T> => ({
  success: true,
  statusCode,
  message,
  data,
  meta: {
    timestamp: new Date().toISOString(),
    requestId: meta.requestId || 'unknown-request-id',
    page: pagination.page,
    limit: pagination.limit,
    total: pagination.total,
    lastPage: Math.ceil(pagination.total / pagination.limit),
    ...meta
  }
});

/**
 * Create an error API response
 */
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
    details
  },
  meta: {
    timestamp: new Date().toISOString(),
    requestId
  }
});

/**
 * Create a validation error response
 */
export const createValidationErrorResponse = (
  errors: Record<string, string[]>,
  requestId: string = 'unknown-request-id'
): ApiResponse<null> => ({
  success: false,
  statusCode: 400,
  message: 'Validation failed',
  data: undefined,
  error: {
    code: ErrorCode.VALIDATION_ERROR,
    message: 'Validation failed',
    details: errors
  },
  meta: {
    timestamp: new Date().toISOString(),
    requestId
  }
});
