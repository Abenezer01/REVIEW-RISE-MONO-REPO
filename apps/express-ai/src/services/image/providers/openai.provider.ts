import OpenAI from 'openai';
import { ImageGenerationOptions, ImageGenerationResult, ImageGeneratorProvider } from '../image-provider.interface';

export class OpenAIImageProvider implements ImageGeneratorProvider {
    private openai: OpenAI | null = null;

    constructor() { }

    private getClient(): OpenAI {
        if (!this.openai) {
            const apiKey = process.env.OPENAI_API_KEY || process.env.LLM_PROVIDER_API_KEY;
            if (!apiKey) {
                console.warn('OPENAI_API_KEY is not set. Requests to OpenAI will fail.');
                throw new Error('OpenAI API Key is missing');
            }
            this.openai = new OpenAI({ apiKey });
        }
        return this.openai;
    }

    async generate(prompt: string, options: ImageGenerationOptions): Promise<ImageGenerationResult> {
        const {
            style = 'Photorealistic',
            quality = 'high',
            aspectRatio = '16:9',
            variations = 1
        } = options;

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

        const response = await this.getClient().images.generate({
            model: "dall-e-3",
            prompt: enhancedPrompt,
            n: 1, // DALL-E 3 only supports n=1
            size: size as any,
            quality: qualityParam as any
        });

        return {
            urls: response.data?.map(img => img.url || '').filter(Boolean) || [],
            prompt: enhancedPrompt,
            settings: { style, quality, aspectRatio, variations }
        };
    }
}
