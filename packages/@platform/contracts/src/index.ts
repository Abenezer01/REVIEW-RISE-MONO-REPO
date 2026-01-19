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
export * from './dtos/keyword.dto';
export * from './dtos/visibility.dto';

// AI Schemas and Prompts
export * from './ai/recommendation.schema';
export * from './ai/visibility-plan.schema';
export * from './ai/prompts/recommendations.prompts';
export * from './ai/prompts/review-sentiment.prompts';

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
