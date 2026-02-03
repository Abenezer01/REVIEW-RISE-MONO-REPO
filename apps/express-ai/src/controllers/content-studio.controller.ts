import { Request, Response } from 'express';
import { contentStudioService } from '../services/content-studio.service';
import { z } from 'zod';
import { createSuccessResponse, createErrorResponse, ErrorCode } from '@platform/contracts';

export class ContentStudioController {

    // Task 2.2: AI Caption Generator
    async generateCaptions(req: Request, res: Response) {
        try {
            const schema = z.object({
                platform: z.string(),
                description: z.string(),
                tone: z.string()
            });
            const { platform, description, tone } = schema.parse(req.body);

            const result = await contentStudioService.generateCaptions(platform, description, tone);
            const response = createSuccessResponse(result, 'Captions generated successfully', 200, { requestId: req.id });
            res.status(response.statusCode).json(response);
        } catch (error: any) {
            console.error('Error generating captions:', error);
            const response = createErrorResponse('Failed to generate captions', ErrorCode.INTERNAL_SERVER_ERROR, 500, error.message, req.id);
            res.status(response.statusCode).json(response);
        }
    }

    // Task 2.3: Hashtag Generator
    async generateHashtags(req: Request, res: Response) {
        try {
            const schema = z.object({
                niche: z.string().optional(),
                audience: z.string().optional(),
                description: z.string().optional(),
                platform: z.string().optional()
            });
            const { niche, audience, description, platform } = schema.parse(req.body);

            // Maintain retro-compatibility or defaults
            const topic = description || niche || 'General';
            const location = 'Global'; // Removing explicit location field for now, or inferring it if needed

            const result = await contentStudioService.generateHashtags(topic, location, platform || 'Instagram', niche, audience);
            const response = createSuccessResponse(result, 'Hashtags generated successfully', 200, { requestId: req.id });
            res.status(response.statusCode).json(response);
        } catch (error: any) {
            console.error('Error generating hashtags:', error);
            const response = createErrorResponse('Failed to generate hashtags', ErrorCode.INTERNAL_SERVER_ERROR, 500, error.message, req.id);
            res.status(response.statusCode).json(response);
        }
    }

    // Task 2.4: Post Idea Generator
    async generateIdeas(req: Request, res: Response) {
        try {
            const schema = z.object({
                businessType: z.string(),
                goal: z.string(),
                tone: z.string().optional().default('professional'),
                platform: z.string().optional().default('Instagram')
            });
            const { businessType, goal, tone, platform } = schema.parse(req.body);

            const result = await contentStudioService.generatePostIdeas(businessType, goal, tone, platform);
            const response = createSuccessResponse(result, 'Ideas generated successfully', 200, { requestId: req.id });
            res.status(response.statusCode).json(response);
        } catch (error: any) {
            console.error('Error generating ideas:', error);
            const response = createErrorResponse('Failed to generate ideas', ErrorCode.INTERNAL_SERVER_ERROR, 500, error.message, req.id);
            res.status(response.statusCode).json(response);
        }
    }

    // Task 2.5: 30-day Plan Generator
    async generatePlan(req: Request, res: Response) {
        try {
            const schema = z.object({
                topic: z.string(),
                businessType: z.string(),
                context: z.any().optional()
            });
            const { topic, businessType, context } = schema.parse(req.body);

            const result = await contentStudioService.generate30DayPlan(topic, businessType, context);
            const response = createSuccessResponse(result, 'Plan generated successfully', 200, { requestId: req.id });
            res.status(response.statusCode).json(response);
        } catch (error: any) {
            console.error('Error generating plan:', error);
            const response = createErrorResponse('Failed to generate plan', ErrorCode.INTERNAL_SERVER_ERROR, 500, error.message, req.id);
            res.status(response.statusCode).json(response);
        }
    }

    // Task 2.6: Image Prompt Generator
    async generateImagePrompt(req: Request, res: Response) {
        try {
            const schema = z.object({
                postIdea: z.string()
            });
            const { postIdea } = schema.parse(req.body);

            const result = await contentStudioService.generateImagePrompt(postIdea);
            const response = createSuccessResponse(result, 'Image prompt generated successfully', 200, { requestId: req.id });
            res.status(response.statusCode).json(response);
        } catch (error: any) {
            console.error('Error generating image prompt:', error);
            const response = createErrorResponse('Failed to generate image prompt', ErrorCode.INTERNAL_SERVER_ERROR, 500, error.message, req.id);
            res.status(response.statusCode).json(response);
        }
    }

    // NEW: AI Prompt Ideas Generator (for Image Studio)
    async generatePromptIdeas(req: Request, res: Response) {
        try {
            const schema = z.object({
                topic: z.string(),
                category: z.string().optional(),
                mood: z.string().optional(),
                style: z.string().optional()
            });
            const { topic, category, mood, style } = schema.parse(req.body);

            const result = await contentStudioService.generatePromptIdeas(topic, category, mood, style);
            const response = createSuccessResponse(result, 'Prompt ideas generated successfully', 200, { requestId: req.id });
            res.status(response.statusCode).json(response);
        } catch (error: any) {
            console.error('Error generating prompt ideas:', error);
            const response = createErrorResponse('Failed to generate prompt ideas', ErrorCode.INTERNAL_SERVER_ERROR, 500, error.message, req.id);
            res.status(response.statusCode).json(response);
        }
    }

    // Task 2.7: AI Image Creation
    async generateImage(req: Request, res: Response) {
        try {
            const schema = z.object({
                prompt: z.string(),
                style: z.string().optional().default('Photorealistic'),
                quality: z.string().optional().default('high'),
                aspectRatio: z.string().optional().default('16:9'),
                variations: z.number().optional().default(1)
            });
            const { prompt, style, quality, aspectRatio, variations } = schema.parse(req.body);

            // Note: This endpoint actually calls DALL-E and costs money/credits
            const result = await contentStudioService.generateImage(prompt, style, quality, aspectRatio, variations);
            const response = createSuccessResponse(result, 'Image generated successfully', 200, { requestId: req.id });
            res.status(response.statusCode).json(response);
        } catch (error: any) {
            console.error('Error generating image:', error);
            const response = createErrorResponse('Failed to generate image', ErrorCode.INTERNAL_SERVER_ERROR, 500, error.message, req.id);
            res.status(response.statusCode).json(response);
        }
    }

    // Task 2.8: Carousel Generator
    async generateCarousel(req: Request, res: Response) {
        try {
            const schema = z.object({
                topic: z.string(),
                tone: z.string().optional().default('professional'),
                platform: z.string().optional().default('Instagram')
            });
            const { topic, tone, platform } = schema.parse(req.body);

            const result = await contentStudioService.generateCarousel(topic, tone, platform);
            const response = createSuccessResponse(result, 'Carousel generated successfully', 200, { requestId: req.id });
            res.status(response.statusCode).json(response);
        } catch (error: any) {
            console.error('Error generating carousel:', error);
            const response = createErrorResponse('Failed to generate carousel', ErrorCode.INTERNAL_SERVER_ERROR, 500, error.message, req.id);
            res.status(response.statusCode).json(response);
        }
    }

    // Task 2.9: Script Generator
    async generateScript(req: Request, res: Response) {
        try {
            const schema = z.object({
                videoTopic: z.string(),
                videoGoal: z.string().optional(),
                targetAudience: z.string().optional(),
                tone: z.string().optional().default('professional'),
                platform: z.string().optional().default('Instagram'),
                duration: z.number().optional().default(30),
                includeSceneDescriptions: z.boolean().optional().default(true),
                includeVisualSuggestions: z.boolean().optional().default(true),
                includeBRollRecommendations: z.boolean().optional().default(false),
                includeCallToAction: z.boolean().optional().default(true)
            });
            const params = schema.parse(req.body);

            // Cast to strictly typed request for service
            const result = await contentStudioService.generateScript(params);
            const response = createSuccessResponse(result, 'Script generated successfully', 200, { requestId: req.id });
            res.status(response.statusCode).json(response);
        } catch (error: any) {
            console.error('Error generating script:', error);
            const response = createErrorResponse('Failed to generate script', ErrorCode.INTERNAL_SERVER_ERROR, 500, error.message, req.id);
            res.status(response.statusCode).json(response);
        }
    }

    // Task 3.0: Unified Complete Post Generator
    async generateCompletePost(req: Request, res: Response) {
        try {
            const schema = z.object({
                platform: z.string(),
                topic: z.string(),
                tone: z.string().optional().default('professional'),
                goal: z.string().optional().default('engagement'),
                audience: z.string().optional().default('general'),
                language: z.string().optional().default('English'),
                length: z.string().optional().default('medium')
            });
            const { platform, topic, tone, goal, audience, language, length } = schema.parse(req.body);

            // Extract businessId from authenticated request
            const businessId = (req as any).user?.businessId;

            const result = await contentStudioService.generateCompletePost(
                platform, 
                topic, 
                tone, 
                goal, 
                audience, 
                language, 
                length,
                businessId
            );
            res.json(result);
        } catch (error) {
            console.error('Error generating complete post:', error);
            res.status(500).json({ error: 'Failed to generate complete post' });
        }
    }
}

export const contentStudioController = new ContentStudioController();
