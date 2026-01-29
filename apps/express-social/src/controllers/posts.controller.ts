
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

            res.status(201).json(createSuccessResponse(
                post,
                'Post created successfully',
                201,
                { requestId: req.id }
            ));
        } catch (error: any) {
            console.error('Error creating post:', error);
            res.status(500).json(createErrorResponse(
                'Failed to create post',
                ErrorCode.INTERNAL_SERVER_ERROR,
                500,
                undefined,
                req.id
            ));
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

            res.status(201).json(createSuccessResponse(
                { count: result.length, posts: result },
                'Posts created successfully',
                201,
                { requestId: req.id }
            ));
        } catch (error: any) {
            console.error('Error creating batch posts:', error);
            res.status(500).json(createErrorResponse(
                'Failed to create batch posts',
                ErrorCode.INTERNAL_SERVER_ERROR,
                500,
                undefined,
                req.id
            ));
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

            res.json(createSuccessResponse(
                { posts },
                'Posts retrieved successfully',
                200,
                { requestId: req.id }
            ));
        } catch (error: any) {
            console.error('Error listing posts:', error);
            res.status(500).json(createErrorResponse(
                'Failed to list posts',
                ErrorCode.INTERNAL_SERVER_ERROR,
                500,
                undefined,
                req.id
            ));
        }
    }
}

export const postsController = new PostsController();
