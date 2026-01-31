import { Request, Response } from 'express';
import { prisma } from '@platform/db';
import {
    createSuccessResponse,
    createErrorResponse,
    ErrorCode
} from '@platform/contracts';

export class PostsController {
    
    // Create a new post (e.g. from Draft)
    async create(req: Request, res: Response) {
        try {
            const data = req.body;

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

            const successResponse = createSuccessResponse(
                post,
                'Post created successfully',
                201,
                { requestId: req.id }
            );
            res.status(successResponse.statusCode).json(successResponse);
        } catch (error: any) {
            console.error('Error creating post:', error);
            const errorResponse = createErrorResponse(
                'Failed to create post',
                ErrorCode.INTERNAL_SERVER_ERROR,
                500,
                undefined,
                req.id
            );
            res.status(errorResponse.statusCode).json(errorResponse);
        }
    }

    // Batch create posts (e.g. for Plans)
    async createBatch(req: Request, res: Response) {
        try {
            const { businessId, posts } = req.body;

            // Use transaction to create all
            const result = await prisma.$transaction(
                posts.map((post: any) => prisma.post.create({
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

            const successResponse = createSuccessResponse(
                { count: result.length, posts: result },
                'Posts created successfully',
                201,
                { requestId: req.id }
            );
            res.status(successResponse.statusCode).json(successResponse);
        } catch (error: any) {
            console.error('Error creating batch posts:', error);
            const errorResponse = createErrorResponse(
                'Failed to create batch posts',
                ErrorCode.INTERNAL_SERVER_ERROR,
                500,
                undefined,
                req.id
            );
            res.status(errorResponse.statusCode).json(errorResponse);
        }
    }

    // List posts with optional filters
    async list(req: Request, res: Response) {
        try {
            const query = req.query as any;

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

            const successResponse = createSuccessResponse(
                { posts },
                'Posts retrieved successfully',
                200,
                { requestId: req.id }
            );
            res.status(successResponse.statusCode).json(successResponse);
        } catch (error: any) {
            console.error('Error listing posts:', error);
            const errorResponse = createErrorResponse(
                'Failed to list posts',
                ErrorCode.INTERNAL_SERVER_ERROR,
                500,
                undefined,
                req.id
            );
            res.status(errorResponse.statusCode).json(errorResponse);
        }
    }
}

export const postsController = new PostsController();
