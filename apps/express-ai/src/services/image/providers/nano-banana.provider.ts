import { GoogleGenerativeAI } from '@google/generative-ai';
import { ImageGenerationOptions, ImageGenerationResult, ImageGeneratorProvider } from '../image-provider.interface';

export class NanoBananaImageProvider implements ImageGeneratorProvider {
    constructor() { }

    async generate(prompt: string, options: ImageGenerationOptions): Promise<ImageGenerationResult> {
        const {
            style = 'Photorealistic',
            aspectRatio = '16:9',
            variations = 1
        } = options;

        const apiKey = process.env.GEMINI_API_KEY || (process.env.AI_IMAGE_PROVIDER === 'nano-banana' ? process.env.LLM_PROVIDER_API_KEY : '');

        if (!apiKey) {
            console.error('Gemini API Key is missing for Nano Banana. Env check:', {
                GEMINI_API_KEY: !!process.env.GEMINI_API_KEY
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
        const enhancedPrompt = `Generate an image: ${prompt}, ${styleEnhancement}${aspectRatioHint}`;

        try {
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

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
                throw new Error('No images returned from Nano Banana. The model may not support image generation or requires different API access.');
            }

            return {
                urls: images,
                prompt: enhancedPrompt,
                settings: options
            };
        } catch (error) {
            console.error('Nano Banana Image Generation Error:', error);
            throw error;
        }
    }
}
