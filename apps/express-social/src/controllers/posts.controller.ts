
import { Request, Response } from 'express';
import { prisma } from '@platform/db';
import { z } from 'zod';

export class PostsController {
    
    // Create a new post (e.g. from Draft)
    async create(req: Request, res: Response) {
        try {
            const schema = z.object({
                businessId: z.string().uuid(),
                content: z.string().optional(),
                platform: z.string(), // 'facebook', 'instagram', 'linkedin'
                status: z.enum(['draft', 'scheduled', 'published']).default('draft'),
                scheduledAt: z.string().datetime().optional(), // ISO String
                mediaUrls: z.array(z.string()).optional(),
                ideaId: z.string().uuid().optional().nullable()
            });

            const data = schema.parse(req.body);

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

            res.status(201).json(post);
        } catch (error: any) {
            console.error('Error creating post:', error);
            if (error instanceof z.ZodError) {
                res.status(400).json({ error: 'Validation failed', details: error.errors });
            } else {
                res.status(500).json({ error: 'Failed to create post' });
            }
        }
    }

    // Batch create posts (e.g. for Plans)
    async createBatch(req: Request, res: Response) {
        try {
            const schema = z.object({
                businessId: z.string().uuid(),
                posts: z.array(z.object({
                    content: z.string().optional(),
                    platform: z.string(),
                    status: z.enum(['draft', 'scheduled', 'published']).default('draft'),
                    scheduledAt: z.string().datetime().optional(),
                    mediaUrls: z.array(z.string()).optional()
                }))
            });

            const { businessId, posts } = schema.parse(req.body);

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

            res.status(201).json({ count: result.length, posts: result });
        } catch (error: any) {
            console.error('Error creating batch posts:', error);
            if (error instanceof z.ZodError) {
                res.status(400).json({ error: 'Validation failed', details: error.errors });
            } else {
                res.status(500).json({ error: 'Failed to create batch posts' });
            }
        }
    }

    // List posts with optional filters
    async list(req: Request, res: Response) {
        try {
            const schema = z.object({
                businessId: z.string().uuid(),
                startDate: z.string().datetime().optional(),
                endDate: z.string().datetime().optional(),
                status: z.enum(['draft', 'scheduled', 'published']).optional()
            });

            const query = schema.parse(req.query);

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

            res.json(posts);
        } catch (error: any) {
            console.error('Error listing posts:', error);
            if (error instanceof z.ZodError) {
                res.status(400).json({ error: 'Validation failed', details: error.errors });
            } else {
                res.status(500).json({ error: 'Failed to list posts' });
            }
        }
    }
}

export const postsController = new PostsController();
