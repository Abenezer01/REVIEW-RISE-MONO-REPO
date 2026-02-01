/**
 * @platform/contracts
 * Shared API contracts for ReviewRise platform
 */

// Request types
export * from './requests';
export * from './auth.schema';

// Response types
export * from './responses';

// System messages
export * from './system-messages';

// Utilities
export * from './utils/encryption.util';

// DTOs
export * from './dtos/location.dto';
export * from './dtos/business.dto';
export * from './dtos/keyword.dto';
export * from './dtos/visibility.dto';

// AI Schemas and Prompts
export * from './ai/ai.schema';
export * from './ai/recommendation.schema';
export * from './ai/visibility-plan.schema';
export * from './ai/review-reply.schema';
export * from './ai/prompts/recommendations.prompts';
export * from './ai/prompts/review-sentiment.prompts';
export * from './ai/prompts/review-reply.prompts';
export * from './ai/content-studio';

// Social Media Integration Schemas
export * from './social';

// Brand Schemas
export * from './brand/brand.schema';

// SEO and Visibility Schemas
export * from './seo/seo.schema';

// Jobs Schemas
export * from './jobs/jobs.schema';

// Admin Schemas
export * from './admin/admin.schema';

// Reviews Schemas
export * from './reviews/reviews.schema';

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
