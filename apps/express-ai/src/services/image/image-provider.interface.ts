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
    data?: any; // Allow flexibility for now if providers return more structure
}

export interface ImageGeneratorProvider {
    generate(prompt: string, options: ImageGenerationOptions): Promise<ImageGenerationResult>;
}
