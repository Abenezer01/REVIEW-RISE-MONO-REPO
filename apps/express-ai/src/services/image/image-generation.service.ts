import { ImageGenerationOptions, ImageGenerationResult, ImageGeneratorProvider } from './image-provider.interface';
import { OpenAIImageProvider } from './providers/openai.provider';
import { GeminiImageProvider } from './providers/gemini.provider';
import { NanoBananaImageProvider } from './providers/nano-banana.provider';

export class ImageGenerationService implements ImageGeneratorProvider {
    private openaiProvider: OpenAIImageProvider;
    private geminiProvider: GeminiImageProvider;
    private nanoBananaProvider: NanoBananaImageProvider;

    constructor() {
        this.openaiProvider = new OpenAIImageProvider();
        this.geminiProvider = new GeminiImageProvider();
        this.nanoBananaProvider = new NanoBananaImageProvider();
    }

    async generate(prompt: string, options: ImageGenerationOptions): Promise<ImageGenerationResult> {
        const provider = process.env.AI_IMAGE_PROVIDER || 'gemini';

        console.log(`Using Image Provider: ${provider}`);

        if (provider === 'nano-banana') {
            try {
                return await this.nanoBananaProvider.generate(prompt, options);
            } catch (error) {
                console.error('Nano Banana Provider Failed', error);
                throw error;
            }
        }

        if (provider === 'gemini') {
            try {
                return await this.geminiProvider.generate(prompt, options);
            } catch (error) {
                console.error('Gemini Provider Failed, falling back to OpenAI if available', error);
                // Optional: Fallback logic could go here, but for now strict separation
                throw error;
            }
        }

        return this.openaiProvider.generate(prompt, options);
    }
}

export const imageGenerationService = new ImageGenerationService();
