import { Request, Response } from 'express';
import { prisma } from '@platform/db';
import { z } from 'zod';
import { createSuccessResponse, createErrorResponse, ErrorCode } from '@platform/contracts';

export class StudioDraftsController {

    // Save Caption Drafts (bulk)
    async saveCaptionDrafts(req: Request, res: Response) {
        try {
            const schema = z.object({
                businessId: z.string().uuid(),
                platform: z.string(),
                tone: z.string(),
                captions: z.array(z.string())
            });

            const data = schema.parse(req.body);

            // Bulk create caption drafts
            const drafts = await Promise.all(
                data.captions.map(caption =>
                    prisma.captionDraft.create({
                        data: {
                            businessId: data.businessId,
                            content: caption,
                            platform: data.platform,
                            tone: data.tone,
                            status: 'generated'
                        }
                    })
                )
            );

            const response = createSuccessResponse({
                count: drafts.length,
                message: 'Caption drafts saved successfully'
            }, 'Created', 201, { requestId: req.id });
            res.status(response.statusCode).json(response);
        } catch (error: any) {
            console.error('Error saving caption drafts:', error);
            if (error instanceof z.ZodError) {
                const response = createErrorResponse('Validation failed', ErrorCode.VALIDATION_ERROR, 400, error.issues, req.id);
                res.status(response.statusCode).json(response);
            } else {
                const response = createErrorResponse('Failed to save caption drafts', ErrorCode.INTERNAL_SERVER_ERROR, 500, undefined, req.id);
                res.status(response.statusCode).json(response);
            }
        }
    }

    // Get Caption Drafts (history)
    async getCaptionDrafts(req: Request, res: Response) {
        try {
            const businessId = req.params.id;
            const limit = req.query.limit as string | undefined;
            const offset = req.query.offset as string | undefined;

            if (!businessId) {
                const response = createErrorResponse('Business ID is required', ErrorCode.BAD_REQUEST, 400, undefined, req.id);
                return res.status(response.statusCode).json(response);
            }

            const drafts = await prisma.captionDraft.findMany({
                where: { businessId },
                orderBy: { createdAt: 'desc' },
                skip: offset ? parseInt(offset) : 0,
                take: limit ? parseInt(limit) : 50
            });

            const response = createSuccessResponse({ drafts, count: drafts.length }, 'Success', 200, { requestId: req.id });
            res.status(response.statusCode).json(response);
        } catch (error: any) {
            console.error('Error fetching caption drafts:', error);
            const response = createErrorResponse('Failed to fetch caption drafts', ErrorCode.INTERNAL_SERVER_ERROR, 500, undefined, req.id);
            res.status(response.statusCode).json(response);
        }
    }

    // Save Content Ideas (bulk)
    async saveContentIdeas(req: Request, res: Response) {
        try {
            const schema = z.object({
                businessId: z.string().uuid(),
                ideas: z.array(z.object({
                    title: z.string(),
                    description: z.string().nullable().optional(),
                    platform: z.string().nullable().optional(),
                    category: z.string().nullable().optional()
                }))
            });

            const data = schema.parse(req.body);

            const ideas = await Promise.all(
                data.ideas.map(idea =>
                    prisma.contentIdea.create({
                        data: {
                            businessId: data.businessId,
                            title: idea.title,
                            description: idea.description,
                            platform: idea.platform || 'General',
                            category: idea.category
                        }
                    })
                )
            );

            const response = createSuccessResponse({ count: ideas.length, message: 'Ideas saved successfully' }, 'Created', 201, { requestId: req.id });
            res.status(response.statusCode).json(response);
        } catch (error: any) {
            console.error('Error saving content ideas:', error);
            if (error instanceof z.ZodError) {
                const response = createErrorResponse('Validation failed', ErrorCode.VALIDATION_ERROR, 400, error.issues, req.id);
                res.status(response.statusCode).json(response);
            } else {
                const response = createErrorResponse('Failed to save content ideas', ErrorCode.INTERNAL_SERVER_ERROR, 500, undefined, req.id);
                res.status(response.statusCode).json(response);
            }
        }
    }

    // Get Content Ideas (history)
    async getContentIdeas(req: Request, res: Response) {
        try {
            const businessId = req.params.id;
            const limit = req.query.limit as string | undefined;
            const offset = req.query.offset as string | undefined;

            if (!businessId) {
                const response = createErrorResponse('Business ID is required', ErrorCode.BAD_REQUEST, 400, undefined, req.id);
                return res.status(response.statusCode).json(response);
            }

            const ideas = await prisma.contentIdea.findMany({
                where: { businessId },
                orderBy: { createdAt: 'desc' },
                skip: offset ? parseInt(offset) : 0,
                take: limit ? parseInt(limit) : 50
            });

            const response = createSuccessResponse({ ideas, count: ideas.length }, 'Success', 200, { requestId: req.id });
            res.status(response.statusCode).json(response);
        } catch (error: any) {
            console.error('Error fetching content ideas:', error);
            const response = createErrorResponse('Failed to fetch content ideas', ErrorCode.INTERNAL_SERVER_ERROR, 500, undefined, req.id);
            res.status(response.statusCode).json(response);
        }
    }

    // Save Image Prompt
    async saveImagePrompt(req: Request, res: Response) {
        try {
            const schema = z.object({
                businessId: z.string().uuid(),
                prompt: z.string(),
                style: z.string().optional(),
                aspectRatio: z.string().optional(),
                imageUrls: z.array(z.string()).optional()
            });

            const data = schema.parse(req.body);

            // Create ImagePrompt
            const imagePrompt = await prisma.imagePrompt.create({
                data: {
                    businessId: data.businessId,
                    prompt: data.prompt,
                    style: data.style,
                    aspectRatio: data.aspectRatio
                }
            });

            // Create GeneratedImage entries if URLs provided
            if (data.imageUrls && data.imageUrls.length > 0) {
                await Promise.all(
                    data.imageUrls.map(url =>
                        prisma.generatedImage.create({
                            data: {
                                promptId: imagePrompt.id,
                                url
                            }
                        })
                    )
                );
            }

            const response = createSuccessResponse({ id: imagePrompt.id, message: 'Image prompt saved successfully' }, 'Created', 201, { requestId: req.id });
            res.status(response.statusCode).json(response);
        } catch (error: any) {
            console.error('Error saving image prompt:', error);
            if (error instanceof z.ZodError) {
                const response = createErrorResponse('Validation failed', ErrorCode.VALIDATION_ERROR, 400, error.issues, req.id);
                res.status(response.statusCode).json(response);
            } else {
                const response = createErrorResponse('Failed to save image prompt', ErrorCode.INTERNAL_SERVER_ERROR, 500, undefined, req.id);
                res.status(response.statusCode).json(response);
            }
        }
    }

    // Save Carousel Draft
    async saveCarouselDraft(req: Request, res: Response) {
        try {
            const schema = z.object({
                businessId: z.string().uuid(),
                topic: z.string(),
                slides: z.array(z.object({
                    title: z.string().optional(),
                    content: z.string().optional(),
                    imagePrompt: z.string().optional()
                }))
            });

            const data = schema.parse(req.body);

            const carouselDraft = await prisma.carouselDraft.create({
                data: {
                    businessId: data.businessId,
                    topic: data.topic,
                    slides: data.slides,
                    status: 'draft'
                }
            });

            const response = createSuccessResponse({ id: carouselDraft.id, message: 'Carousel draft saved successfully' }, 'Created', 201, { requestId: req.id });
            res.status(response.statusCode).json(response);
        } catch (error: any) {
            console.error('Error saving carousel draft:', error);
            if (error instanceof z.ZodError) {
                const response = createErrorResponse('Validation failed', ErrorCode.VALIDATION_ERROR, 400, error.issues, req.id);
                res.status(response.statusCode).json(response);
            } else {
                const response = createErrorResponse('Failed to save carousel draft', ErrorCode.INTERNAL_SERVER_ERROR, 500, undefined, req.id);
                res.status(response.statusCode).json(response);
            }
        }
    }

    // Get Carousel Drafts (history)
    async getCarouselDrafts(req: Request, res: Response) {
        try {
            const businessId = req.params.id;
            const limit = req.query.limit as string | undefined;
            const offset = req.query.offset as string | undefined;

            if (!businessId) {
                const response = createErrorResponse('Business ID is required', ErrorCode.BAD_REQUEST, 400, undefined, req.id);
                return res.status(response.statusCode).json(response);
            }

            const drafts = await prisma.carouselDraft.findMany({
                where: { businessId },
                orderBy: { createdAt: 'desc' },
                take: limit ? parseInt(limit) : 10,
                skip: offset ? parseInt(offset) : 0
            });

            const count = await prisma.carouselDraft.count({
                where: { businessId }
            });

            const response = createSuccessResponse({ drafts, count }, 'Success', 200, { requestId: req.id });
            res.status(response.statusCode).json(response);
        } catch (error) {
            console.error('Error fetching carousel drafts:', error);
            const response = createErrorResponse('Failed to fetch carousel drafts', ErrorCode.INTERNAL_SERVER_ERROR, 500, undefined, req.id);
            res.status(response.statusCode).json(response);
        }
    }

    // Save Script Draft
    async saveScriptDraft(req: Request, res: Response) {
        try {
            const schema = z.object({
                businessId: z.string().uuid(),
                title: z.string().optional(),
                platform: z.string(),
                hook: z.string().optional(),
                body: z.string().optional(),
                cta: z.string().optional(),
                duration: z.string().optional()
            });

            const data = schema.parse(req.body);

            const scriptDraft = await prisma.scriptDraft.create({
                data: {
                    businessId: data.businessId,
                    title: data.title,
                    platform: data.platform,
                    hook: data.hook,
                    body: data.body,
                    cta: data.cta,
                    duration: data.duration
                }
            });

            const response = createSuccessResponse({ id: scriptDraft.id, message: 'Script draft saved successfully' }, 'Created', 201, { requestId: req.id });
            res.status(response.statusCode).json(response);
        } catch (error: any) {
            console.error('Error saving script draft:', error);
            if (error instanceof z.ZodError) {
                const response = createErrorResponse('Validation failed', ErrorCode.VALIDATION_ERROR, 400, error.issues, req.id);
                res.status(response.statusCode).json(response);
            } else {
                const response = createErrorResponse('Failed to save script draft', ErrorCode.INTERNAL_SERVER_ERROR, 500, undefined, req.id);
                res.status(response.statusCode).json(response);
            }
        }
    }
}

export const studioDraftsController = new StudioDraftsController();
