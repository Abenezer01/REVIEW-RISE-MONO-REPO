import { z } from 'zod';

// ============================================================================
// Create Post Schemas
// ============================================================================

export const CreatePostRequestSchema = z.object({
    businessId: z.string().uuid(),
    content: z.string().optional(),
    platform: z.string(), // 'facebook', 'instagram', 'linkedin'
    status: z.enum(['draft', 'scheduled', 'published']).default('draft'),
    scheduledAt: z.string().datetime().optional(), // ISO String
    mediaUrls: z.array(z.string()).optional(),
    ideaId: z.string().uuid().optional().nullable()
});

export type CreatePostRequest = z.infer<typeof CreatePostRequestSchema>;

export interface CreatePostResponse {
    id: string;
    businessId: string;
    content: string | null;
    platform: string;
    status: string;
    scheduledAt: Date | null;
    mediaUrls: string[];
    ideaId: string | null;
    createdAt: Date;
    updatedAt: Date;
}

// ============================================================================
// Batch Create Posts Schemas
// ============================================================================

export const CreateBatchPostsRequestSchema = z.object({
    businessId: z.string().uuid(),
    posts: z.array(z.object({
        content: z.string().optional(),
        platform: z.string(),
        status: z.enum(['draft', 'scheduled', 'published']).default('draft'),
        scheduledAt: z.string().datetime().optional(),
        mediaUrls: z.array(z.string()).optional()
    }))
});

export type CreateBatchPostsRequest = z.infer<typeof CreateBatchPostsRequestSchema>;

export interface CreateBatchPostsResponse {
    count: number;
    posts: CreatePostResponse[];
}

// ============================================================================
// List Posts Schemas
// ============================================================================

export const ListPostsQuerySchema = z.object({
    businessId: z.string().uuid(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    status: z.enum(['draft', 'scheduled', 'published']).optional()
});

export type ListPostsQuery = z.infer<typeof ListPostsQuerySchema>;

export interface ListPostsResponse {
    posts: CreatePostResponse[];
}
