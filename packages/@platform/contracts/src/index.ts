/**
 * @platform/contracts
 * Shared API contracts for ReviewRise platform
 */

// Request types
export * from './requests';

// Auth types
export * from './auth.schema';

// Response types
// Response types
export * from './responses';

// Utilities
export * from './utils/encryption.util';

// DTOs
export * from './dtos/location.dto';
export * from './dtos/business.dto';

// Utilities
export * from './utils/encryption.util';
export * from './dtos/keyword.dto';
export * from './dtos/visibility.dto';

// Brand Schemas
export * from './brand';

// AI Schemas and Prompts
export * from './ai/recommendation.schema';
export * from './ai/visibility-plan.schema';
export * from './ai/review-reply.schema';
export * from './ai/prompts/recommendations.prompts';
export * from './ai/prompts/review-sentiment.prompts';
export * from './ai/prompts/review-reply.prompts';
export * from './ai/content-studio';

// Social Media Integration Schemas
export * from './social';

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
