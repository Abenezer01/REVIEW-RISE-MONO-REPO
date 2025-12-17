// ============================================================================
// Request Types
// ============================================================================

export interface ApiRequest<B = unknown, Q = unknown, P = unknown> {
  body: B;
  query: Q;
  params: P;
}

// ============================================================================
// Pagination Types
// ============================================================================

/**
 * Pagination metadata returned in API responses
 */
export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  lastPage: number;
}

/**
 * Pagination query parameters for API requests
 */
export interface PaginationQuery {
  page?: number;
  limit?: number;
  pageSize?: number;
  skip?: number;
}

// ============================================================================
// Query Types
// ============================================================================

export interface SortQuery {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  property?: string;
  direction?: 'asc' | 'desc';
}

export interface SearchQuery {
  search?: string;
  fields?: string[]; // Fields to search in
}

export interface FilterQuery {
  filter?: Record<string, any>;
}

export interface BaseQuery extends PaginationQuery, SortQuery, SearchQuery, FilterQuery {
  [key: string]: any;
}

// ============================================================================
// Request Parameter Types
// ============================================================================

/**
 * Standard GET request parameters
 */
export interface GetRequestParams extends BaseQuery {
  pagination?: { pageSize: number; page: number } | null;
  sorting?: { property: string; direction: 'asc' | 'desc' } | null;
  export?: ExportParams | null;
  locale?: string;
}

/**
 * Export parameters for data export requests
 */
export interface ExportParams {
  format: 'csv' | 'excel' | 'pdf' | string;
  fields?: string[];
  currentPageOnly?: boolean;
}

/**
 * Standard POST request parameters
 */
export interface PostRequestParams<T = any> {
  data?: T | null;
  files?: FileUpload[] | null;
}

/**
 * File upload type
 */
export interface FileUpload {
  type: string;
  file: File;
  name?: string;
}

/**
 * Standard PUT/PATCH request parameters
 */
export interface PutRequestParams<T = any> {
  data?: T | null;
  published?: boolean | null;
  archived?: boolean | null;
}

/**
 * Standard DELETE request parameters
 */
export interface DeleteRequestParams {
  id?: string | number;
  ids?: (string | number)[];
  soft?: boolean; // Soft delete flag
}

// ============================================================================
// Default Values
// ============================================================================

export const defaultGetRequestParams: GetRequestParams = {
  pagination: null,
  filter: undefined,
  sorting: null,
  export: null
};

export const defaultPagination: Pagination = {
  page: 1,
  pageSize: 10,
  total: 0,
  lastPage: 1
};

// ============================================================================
// Payload Types
// ============================================================================

/**
 * Generic API payload structure
 */
export interface ApiPayload<T = any> {
  data: T;
  files?: FileUpload[] | any[];
}
