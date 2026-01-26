import { Request, Response } from 'express';
import { contentStudioService } from '../services/content-studio.service';
import {
    createSuccessResponse,
    createErrorResponse,
    ErrorCode,
    GenerateCaptionsRequestSchema,
    GenerateHashtagsRequestSchema,
    GenerateIdeasRequestSchema,
    GeneratePlanRequestSchema,
    GenerateImagePromptRequestSchema,
    GeneratePromptIdeasRequestSchema,
    GenerateImageRequestSchema,
    GenerateCarouselRequestSchema,
    GenerateScriptRequestSchema
} from '@platform/contracts';

export class ContentStudioController {

    // Task 2.2: AI Caption Generator
    async generateCaptions(req: Request, res: Response) {
        try {
            const parseResult = GenerateCaptionsRequestSchema.safeParse(req.body);
            if (!parseResult.success) {
                return res.status(400).json(createErrorResponse('Invalid request body', ErrorCode.VALIDATION_ERROR, 400, parseResult.error.issues, req.id));
            }
            const { platform, description, tone } = parseResult.data;

            const result = await contentStudioService.generateCaptions(platform, description, tone);
            res.json(createSuccessResponse(result, 'Captions generated successfully', 200, { requestId: req.id }));
        } catch (error) {
            console.error('Error generating captions:', error);
            res.status(500).json(createErrorResponse('Failed to generate captions', ErrorCode.INTERNAL_SERVER_ERROR, 500, undefined, req.id));
        }
    }

    // Task 2.3: Hashtag Generator
    async generateHashtags(req: Request, res: Response) {
        try {
            const parseResult = GenerateHashtagsRequestSchema.safeParse(req.body);
            if (!parseResult.success) {
                return res.status(400).json(createErrorResponse('Invalid request body', ErrorCode.VALIDATION_ERROR, 400, parseResult.error.issues, req.id));
            }
            const { niche, audience, description, platform } = parseResult.data;

            // Maintain retro-compatibility or defaults
            const topic = description || niche || 'General';
            const location = 'Global';

            const result = await contentStudioService.generateHashtags(topic, location, platform || 'Instagram', niche, audience);
            res.json(createSuccessResponse(result, 'Hashtags generated successfully', 200, { requestId: req.id }));
        } catch (error) {
            console.error('Error generating hashtags:', error);
            res.status(500).json(createErrorResponse('Failed to generate hashtags', ErrorCode.INTERNAL_SERVER_ERROR, 500, undefined, req.id));
        }
    }

    // Task 2.4: Post Idea Generator
    async generateIdeas(req: Request, res: Response) {
        try {
            const parseResult = GenerateIdeasRequestSchema.safeParse(req.body);
            if (!parseResult.success) {
                return res.status(400).json(createErrorResponse('Invalid request body', ErrorCode.VALIDATION_ERROR, 400, parseResult.error.issues, req.id));
            }
            const { businessType, goal, tone, platform } = parseResult.data;

            const result = await contentStudioService.generatePostIdeas(businessType, goal, tone, platform);
            res.json(createSuccessResponse(result, 'Post ideas generated successfully', 200, { requestId: req.id }));
        } catch (error) {
            console.error('Error generating ideas:', error);
            res.status(500).json(createErrorResponse('Failed to generate ideas', ErrorCode.INTERNAL_SERVER_ERROR, 500, undefined, req.id));
        }
    }

    // Task 2.5: 30-day Plan Generator
    async generatePlan(req: Request, res: Response) {
        try {
            const parseResult = GeneratePlanRequestSchema.safeParse(req.body);
            if (!parseResult.success) {
                return res.status(400).json(createErrorResponse('Invalid request body', ErrorCode.VALIDATION_ERROR, 400, parseResult.error.issues, req.id));
            }
            const { topic, businessType } = parseResult.data;

            const result = await contentStudioService.generate30DayPlan(topic, businessType);
            res.json(createSuccessResponse(result, '30-day plan generated successfully', 200, { requestId: req.id }));
        } catch (error) {
            console.error('Error generating plan:', error);
            res.status(500).json(createErrorResponse('Failed to generate plan', ErrorCode.INTERNAL_SERVER_ERROR, 500, undefined, req.id));
        }
    }

    // Task 2.6: Image Prompt Generator
    async generateImagePrompt(req: Request, res: Response) {
        try {
            const parseResult = GenerateImagePromptRequestSchema.safeParse(req.body);
            if (!parseResult.success) {
                return res.status(400).json(createErrorResponse('Invalid request body', ErrorCode.VALIDATION_ERROR, 400, parseResult.error.issues, req.id));
            }
            const { postIdea } = parseResult.data;

            const result = await contentStudioService.generateImagePrompt(postIdea);
            res.json(createSuccessResponse(result, 'Image prompt generated successfully', 200, { requestId: req.id }));
        } catch (error) {
            console.error('Error generating image prompt:', error);
            res.status(500).json(createErrorResponse('Failed to generate image prompt', ErrorCode.INTERNAL_SERVER_ERROR, 500, undefined, req.id));
        }
    }

    // NEW: AI Prompt Ideas Generator (for Image Studio)
    async generatePromptIdeas(req: Request, res: Response) {
        try {
            const parseResult = GeneratePromptIdeasRequestSchema.safeParse(req.body);
            if (!parseResult.success) {
                return res.status(400).json(createErrorResponse('Invalid request body', ErrorCode.VALIDATION_ERROR, 400, parseResult.error.issues, req.id));
            }
            const { topic, category, mood, style } = parseResult.data;

            const result = await contentStudioService.generatePromptIdeas(topic, category, mood, style);
            res.json(createSuccessResponse(result, 'Prompt ideas generated successfully', 200, { requestId: req.id }));
        } catch (error) {
            console.error('Error generating prompt ideas:', error);
            res.status(500).json(createErrorResponse('Failed to generate prompt ideas', ErrorCode.INTERNAL_SERVER_ERROR, 500, undefined, req.id));
        }
    }

    // Task 2.7: AI Image Creation
    async generateImage(req: Request, res: Response) {
        try {
            const parseResult = GenerateImageRequestSchema.safeParse(req.body);
            if (!parseResult.success) {
                return res.status(400).json(createErrorResponse('Invalid request body', ErrorCode.VALIDATION_ERROR, 400, parseResult.error.issues, req.id));
            }
            const { prompt, style, quality, aspectRatio, variations } = parseResult.data;

            const result = await contentStudioService.generateImage(prompt, style, quality, aspectRatio, variations);
            res.json(createSuccessResponse(result, 'Image generated successfully', 200, { requestId: req.id }));
        } catch (error) {
            console.error('Error generating image:', error);
            res.status(500).json(createErrorResponse('Failed to generate image', ErrorCode.INTERNAL_SERVER_ERROR, 500, undefined, req.id));
        }
    }

    // Task 2.8: Carousel Generator
    async generateCarousel(req: Request, res: Response) {
        try {
            const parseResult = GenerateCarouselRequestSchema.safeParse(req.body);
            if (!parseResult.success) {
                return res.status(400).json(createErrorResponse('Invalid request body', ErrorCode.VALIDATION_ERROR, 400, parseResult.error.issues, req.id));
            }
            const { topic, tone, platform } = parseResult.data;

            const result = await contentStudioService.generateCarousel(topic, tone, platform);
            res.json(createSuccessResponse(result, 'Carousel generated successfully', 200, { requestId: req.id }));
        } catch (error) {
            console.error('Error generating carousel:', error);
            res.status(500).json(createErrorResponse('Failed to generate carousel', ErrorCode.INTERNAL_SERVER_ERROR, 500, undefined, req.id));
        }
    }

    // Task 2.9: Script Generator
    async generateScript(req: Request, res: Response) {
        try {
            const parseResult = GenerateScriptRequestSchema.safeParse(req.body);
            if (!parseResult.success) {
                return res.status(400).json(createErrorResponse('Invalid request body', ErrorCode.VALIDATION_ERROR, 400, parseResult.error.issues, req.id));
            }
            const params = parseResult.data;

            const result = await contentStudioService.generateScript(params);
            res.json(createSuccessResponse(result, 'Script generated successfully', 200, { requestId: req.id }));
        } catch (error) {
            console.error('Error generating script:', error);
            res.status(500).json(createErrorResponse('Failed to generate script', ErrorCode.INTERNAL_SERVER_ERROR, 500, undefined, req.id));
        }
    }
}

export const contentStudioController = new ContentStudioController();
