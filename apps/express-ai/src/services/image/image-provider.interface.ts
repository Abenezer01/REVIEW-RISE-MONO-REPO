export interface ImageGenerationOptions {
    style?: string;
    quality?: string;
    aspectRatio?: string;
    variations?: number;
}

export interface ImageGenerationResult {
    urls: string[];
    prompt: string;
    settings: ImageGenerationOptions;
}

export interface ImageGeneratorProvider {
    generate(prompt: string, options: ImageGenerationOptions): Promise<ImageGenerationResult>;
}
