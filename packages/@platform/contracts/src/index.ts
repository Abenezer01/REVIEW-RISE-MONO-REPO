/**
 * @platform/contracts
 * Shared API contracts for ReviewRise platform
 */

// Request types
export * from './requests';

// Response types
// Response types
export * from './responses';

// DTOs
export * from './dtos/location.dto';
export * from './dtos/business.dto';

// Re-export commonly used types from requests
export type {
    ApiRequest,
    Pagination,
    PaginationQuery,
    GetRequestParams,
    PostRequestParams,
    PutRequestParams,
    DeleteRequestParams,
    ExportParams,
    ApiPayload
} from './requests';

// Re-export commonly used types from responses
export type {
    ApiResponse,
    PaginatedResponse,
    ApiError,
    ApiMeta
} from './responses';
