
import { Request, Response } from 'express';
import { contentStudioService } from '../services/content-studio.service';
import { z } from 'zod';

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
            res.json(result);
        } catch (error) {
            console.error('Error generating captions:', error);
            res.status(500).json({ error: 'Failed to generate captions' });
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
            res.json(result);
        } catch (error) {
            console.error('Error generating hashtags:', error);
            res.status(500).json({ error: 'Failed to generate hashtags' });
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
            res.json(result);
        } catch (error) {
            console.error('Error generating ideas:', error);
            res.status(500).json({ error: 'Failed to generate ideas' });
        }
    }

    // Task 2.5: 30-day Plan Generator
    async generatePlan(req: Request, res: Response) {
        try {
            const schema = z.object({
                topic: z.string(),
                businessType: z.string()
            });
            const { topic, businessType } = schema.parse(req.body);

            const result = await contentStudioService.generate30DayPlan(topic, businessType);
            res.json(result);
        } catch (error) {
            console.error('Error generating plan:', error);
            res.status(500).json({ error: 'Failed to generate plan' });
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
            res.json(result);
        } catch (error) {
            console.error('Error generating image prompt:', error);
            res.status(500).json({ error: 'Failed to generate image prompt' });
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
            res.json(result);
        } catch (error) {
            console.error('Error generating prompt ideas:', error);
            res.status(500).json({ error: 'Failed to generate prompt ideas' });
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
            res.json(result);
        } catch (error) {
            console.error('Error generating image:', error);
            res.status(500).json({ error: 'Failed to generate image' });
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
            res.json(result);
        } catch (error) {
            console.error('Error generating carousel:', error);
            res.status(500).json({ error: 'Failed to generate carousel' });
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
            res.json(result);
        } catch (error) {
            console.error('Error generating script:', error);
            res.status(500).json({ error: 'Failed to generate script' });
        }
    }
}

export const contentStudioController = new ContentStudioController();
