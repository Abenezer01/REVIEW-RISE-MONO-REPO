
import { Request, Response } from 'express';
import { prisma } from '@platform/db';
import {
    CreatePostRequestSchema,
    CreateBatchPostsRequestSchema,
    ListPostsQuerySchema,
    createSuccessResponse,
    createErrorResponse,
    ErrorCode
} from '@platform/contracts';

export class PostsController {
    
    // Create a new post (e.g. from Draft)
    async create(req: Request, res: Response) {
        const requestId = req.id;
        try {
            const parseResult = CreatePostRequestSchema.safeParse(req.body);
            if (!parseResult.success) {
                const response = createErrorResponse(
                    'Invalid request body',
                    ErrorCode.VALIDATION_ERROR,
                    400,
                    parseResult.error.issues,
                    requestId
                );
                return res.status(400).json(response);
            }

            const data = parseResult.data;

            const post = await prisma.post.create({
                data: {
                    businessId: data.businessId,
                    content: data.content,
                    platform: data.platform,
                    status: data.status,
                    scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
                    mediaUrls: data.mediaUrls || [],
                    ideaId: data.ideaId
                }
            });

            const response = createSuccessResponse(
                post,
                'Post created successfully',
                201,
                { requestId }
            );
            res.status(201).json(response);
        } catch (error: any) {
            console.error('Error creating post:', error);
            const response = createErrorResponse(
                'Failed to create post',
                ErrorCode.INTERNAL_SERVER_ERROR,
                500,
                undefined,
                requestId
            );
            res.status(500).json(response);
        }
    }

    // Batch create posts (e.g. for Plans)
    async createBatch(req: Request, res: Response) {
        const requestId = req.id;
        try {
            const parseResult = CreateBatchPostsRequestSchema.safeParse(req.body);
            if (!parseResult.success) {
                const response = createErrorResponse(
                    'Invalid request body',
                    ErrorCode.VALIDATION_ERROR,
                    400,
                    parseResult.error.issues,
                    requestId
                );
                return res.status(400).json(response);
            }

            const { businessId, posts } = parseResult.data;

            // Use transaction to create all
            const result = await prisma.$transaction(
                posts.map(post => prisma.post.create({
                    data: {
                        businessId,
                        content: post.content,
                        platform: post.platform,
                        status: post.status,
                        scheduledAt: post.scheduledAt ? new Date(post.scheduledAt) : null,
                        mediaUrls: post.mediaUrls || []
                    }
                }))
            );

            const response = createSuccessResponse(
                { count: result.length, posts: result },
                'Posts created successfully',
                201,
                { requestId }
            );
            res.status(201).json(response);
        } catch (error: any) {
            console.error('Error creating batch posts:', error);
            const response = createErrorResponse(
                'Failed to create batch posts',
                ErrorCode.INTERNAL_SERVER_ERROR,
                500,
                undefined,
                requestId
            );
            res.status(500).json(response);
        }
    }

    // List posts with optional filters
    async list(req: Request, res: Response) {
        const requestId = req.id;
        try {
            const parseResult = ListPostsQuerySchema.safeParse(req.query);
            if (!parseResult.success) {
                const response = createErrorResponse(
                    'Invalid query parameters',
                    ErrorCode.VALIDATION_ERROR,
                    400,
                    parseResult.error.issues,
                    requestId
                );
                return res.status(400).json(response);
            }

            const query = parseResult.data;

            const where: any = {
                businessId: query.businessId
            };

            if (query.status) {
                where.status = query.status;
            }

            if (query.startDate || query.endDate) {
                where.scheduledAt = {};
                if (query.startDate) where.scheduledAt.gte = new Date(query.startDate);
                if (query.endDate) where.scheduledAt.lte = new Date(query.endDate);
            }

            const posts = await prisma.post.findMany({
                where,
                orderBy: { scheduledAt: 'asc' }
            });

            const response = createSuccessResponse(
                { posts },
                'Posts retrieved successfully',
                200,
                { requestId }
            );
            res.json(response);
        } catch (error: any) {
            console.error('Error listing posts:', error);
            const response = createErrorResponse(
                'Failed to list posts',
                ErrorCode.INTERNAL_SERVER_ERROR,
                500,
                undefined,
                requestId
            );
            res.status(500).json(response);
        }
    }
}

export const postsController = new PostsController();
