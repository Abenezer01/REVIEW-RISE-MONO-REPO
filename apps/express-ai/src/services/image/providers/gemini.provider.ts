import { GoogleGenerativeAI } from '@google/generative-ai';
import { ImageGenerationOptions, ImageGenerationResult, ImageGeneratorProvider } from '../image-provider.interface';

export class GeminiImageProvider implements ImageGeneratorProvider {
    constructor() { }

    async generate(prompt: string, options: ImageGenerationOptions): Promise<ImageGenerationResult> {
        const {
            style = 'Photorealistic',
            aspectRatio = '16:9',
            variations = 1
        } = options;

        const apiKey = process.env.GEMINI_API_KEY || (process.env.AI_IMAGE_PROVIDER === 'gemini' ? process.env.LLM_PROVIDER_API_KEY : '');

        if (!apiKey) {
            console.error('Gemini API Key is missing. Env check:', {
                GEMINI_API_KEY: !!process.env.GEMINI_API_KEY,
                AI_IMAGE_PROVIDER: process.env.AI_IMAGE_PROVIDER,
                LLM_PROVIDER_API_KEY: !!process.env.LLM_PROVIDER_API_KEY
            });
            throw new Error('Gemini API Key is missing');
        }

        // Enhance prompt with style and aspect ratio
        const stylePrompts: Record<string, string> = {
            'Photorealistic': 'photorealistic, high detail, professional photography',
            'Digital Art': 'digital art, vibrant colors, modern illustration',
            '3D Render': '3D render, octane render, highly detailed',
            'Illustration': 'hand-drawn illustration, artistic, creative'
        };
        const styleEnhancement = stylePrompts[style] || '';

        // Add aspect ratio hint to prompt
        const aspectRatioHint = aspectRatio ? `, aspect ratio ${aspectRatio}` : '';
        const enhancedPrompt = `${prompt}, ${styleEnhancement}${aspectRatioHint}`;

        try {
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: 'imagen-3.0-generate-001' });

            const images: string[] = [];

            // Generate multiple variations if requested
            for (let i = 0; i < variations; i++) {
                const result = await model.generateContent({
                    contents: [{ role: 'user', parts: [{ text: enhancedPrompt }] }],
                });

                const response = result.response;

                if (response.candidates && response.candidates[0]?.content?.parts) {
                    for (const part of response.candidates[0].content.parts) {
                        if (part.inlineData?.data) {
                            images.push(`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`);
                        }
                    }
                }
            }

            if (images.length === 0) {
                throw new Error('No images returned from Gemini. The model may not support image generation via this SDK method.');
            }

            return {
                urls: images,
                prompt: enhancedPrompt,
                settings: options
            };
        } catch (error) {
            console.error('Gemini Image Generation Error:', error);
            throw error;
        }
    }
}
