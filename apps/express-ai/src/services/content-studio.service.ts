import { llmService } from './llm.service';
import OpenAI from 'openai'; // Still needed for DALL-E direct call if kept here

import { GenerateScriptRequest, GenerateScriptResponse } from '@platform/contracts';
import { prisma } from '@platform/db';
import { PROMPTS } from '../prompts/content-studio.prompts';

export class ContentStudioService {
    // Fetch brand identity context from database
    private async getBrandContext(businessId?: string) {
        if (!businessId) return null;

        // Fetch both business info and brand DNA
        const [business, brandDNA] = await Promise.all([
            prisma.business.findUnique({
                where: { id: businessId },
                select: { name: true }
            }),
            prisma.brandDNA.findUnique({
                where: { businessId }
            })
        ]);

        return {
            businessName: business?.name || null,
            voice: brandDNA?.voice || null,
            values: brandDNA?.values || null,
            mission: brandDNA?.mission || null,
            audience: brandDNA?.audience || null
        };
    }

    // Format brand context for LLM prompts
    private formatBrandContext(brandContext: any) {
        if (!brandContext) return '';

        const parts = [];
        if (brandContext.businessName) parts.push(`- Business Name: ${brandContext.businessName}`);
        if (brandContext.voice) parts.push(`- Brand Voice: ${brandContext.voice}`);
        if (brandContext.values?.length) parts.push(`- Core Values: ${brandContext.values.join(', ')}`);
        if (brandContext.mission) parts.push(`- Mission: ${brandContext.mission}`);
        if (brandContext.audience) parts.push(`- Target Audience: ${brandContext.audience}`);

        if (parts.length === 0) return '';

        return `\nBRAND IDENTITY:\n${parts.join('\n')}\n`;
    }

    // Kept for DALL-E specific logic
    private getOpenAI() {
        const apiKey = process.env.OPENAI_API_KEY || process.env.LLM_PROVIDER_API_KEY;
        if (!apiKey) {
            throw new Error('OPENAI_API_KEY or LLM_PROVIDER_API_KEY is not set');
        }
        return new OpenAI({ apiKey });
    }

    async generateCaptions(platform: string, description: string, tone: string) {
        const prompt = PROMPTS.CAPTIONS.GENERATE(platform, description, tone);
        return llmService.generateJSON(prompt);
    }

    async generateHashtags(topic: string, location: string, platform: string, niche?: string, audience?: string) {
        const prompt = PROMPTS.HASHTAGS.GENERATE(topic, location, platform, niche, audience);
        return llmService.generateJSON(prompt);
    }

    async generatePostIdeas(businessType: string, goal: string, tone?: string, platform?: string) {
        const prompt = PROMPTS.IDEAS.GENERATE(businessType, goal, tone, platform);
        return llmService.generateJSON(prompt);
    }

    async generate30DayPlan(topic: string, businessType: string, context?: any) {
        const prompt = PROMPTS.PLAN.GENERATE_30DAY(topic, businessType, context);

        return llmService.generateJSON(prompt);
    }

    async generateImagePrompt(postIdea: string) {
        const prompt = PROMPTS.IMAGE.GENERATE_PROMPT(postIdea);
        return llmService.generateJSON(prompt);
    }

    async generatePromptIdeas(topic: string, category?: string, mood?: string, style?: string) {
        const prompt = PROMPTS.IMAGE.GENERATE_IDEAS(topic, category, mood, style);
        return llmService.generateJSON(prompt);
    }

    async adaptContent(template: string, context: any) {
        const { businessName, industry, audience, voice, mission, seasonalHook, seasonalDescription } = context;

        const prompt = `You are a social media copywriter. Adapt the following content template for a specific brand.

Brand: ${businessName}
Industry: ${industry}
Target Audience: ${audience || 'General'}
Brand Voice: ${voice || 'Professional'}
Brand Mission: ${mission || ''}
${seasonalHook ? `Seasonal Event: ${seasonalHook} (${seasonalDescription || ''})` : ''}

Template: "${template}"

Guidelines:
- Maintain the core message of the template.
- Inject the brand's personality and voice.
- Make it highly relevant to the target audience.
- If there is a seasonal hook, integrate it naturally.
- Keep the length appropriate for social media.
- Include 1-3 relevant emojis.

Return a JSON object: { "adaptedText": "Your adapted caption here" }`;

        return llmService.generateJSON(prompt);
    }

    async generateImage(
        prompt: string, 
        style: string = 'Photorealistic',
        quality: string = 'high',
        aspectRatio: string = '16:9',
        variations: number = 1
    ) {
        const openai = this.getOpenAI();
        
        // Map aspect ratio to DALL-E size format
        const sizeMap: Record<string, string> = {
            '1:1': '1024x1024',
            '16:9': '1792x1024',
            '9:16': '1024x1792',
            '4:3': '1024x1024'
        };
        const size = sizeMap[aspectRatio] || '1024x1024';

        // Enhance prompt with style
        const stylePrompts: Record<string, string> = {
            'Photorealistic': 'photorealistic, high detail, professional photography',
            'Digital Art': 'digital art, vibrant colors, modern illustration',
            '3D Render': '3D render, octane render, highly detailed',
            'Illustration': 'hand-drawn illustration, artistic, creative'
        };
        const styleEnhancement = stylePrompts[style] || '';
        const enhancedPrompt = `${prompt}, ${styleEnhancement}`;

        // Map quality to DALL-E quality parameter
        const qualityParam = quality === 'high' ? 'hd' : 'standard';

        const response = await openai.images.generate({
            model: "dall-e-3",
            prompt: enhancedPrompt,
            n: 1, // DALL-E 3 only supports n=1
            size: size as any,
            quality: qualityParam as any
        });
        
        return {
            urls: response.data?.map(img => img.url) || [],
            prompt: enhancedPrompt,
            settings: { style, quality, aspectRatio, variations }
        };
    }

    async generateCarousel(topic: string, tone?: string, platform?: string) {
        const prompt = PROMPTS.CAROUSEL.GENERATE(topic, tone, platform);
        return llmService.generateJSON(prompt);
    }

    async generateScript(params: GenerateScriptRequest): Promise<GenerateScriptResponse> {
        const { 
            videoTopic, 
            videoGoal, 
            targetAudience, 
            tone = 'professional', 
            platform = 'Instagram',
            duration = 30,
            includeCallToAction
        } = params;

        const numScenes = duration <= 15 ? 2 : duration <= 30 ? 3 : duration <= 60 ? 4 : Math.min(Math.ceil(duration / 20), 10);

        const prompt = PROMPTS.SCRIPT.GENERATE_VIDEO({
            videoTopic,
            duration,
            platform,
            tone,
            videoGoal,
            targetAudience,
            numScenes,
            includeCallToAction
        });

        return llmService.generateJSON(prompt);
    }

    async generateVideoScript(topic: string, duration: string, platform: string) {
        const prompt = PROMPTS.SCRIPT.GENERATE_SHORT(topic, duration, platform);
        return llmService.generateJSON(prompt);
    }

    async generateCompletePost(
        platform: string,
        topic: string,
        tone: string = 'professional',
        goal: string = 'engagement',
        audience: string = 'general',
        language: string = 'English',
        length: string = 'medium',
        businessId?: string
    ) {
        // Fetch brand context if businessId is provided
        const brandContext = await this.getBrandContext(businessId);
        const brandContextString = this.formatBrandContext(brandContext);

        const prompt = PROMPTS.POST.GENERATE_COMPLETE({
            platform,
            topic,
            tone,
            goal,
            audience,
            language,
            length,
            brandContext: brandContextString
        });

        return llmService.generateJSON(prompt);
    }
}

export const contentStudioService = new ContentStudioService();
