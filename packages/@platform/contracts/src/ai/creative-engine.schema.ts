export interface CreativeConceptInput {
    offer: string;
    audience: string;
    painPoints: string[];
    tone: BrandToneProfile;
    enableImages?: boolean;
}

export interface BrandToneProfile {
    toneType: 'Friendly' | 'Professional' | 'Luxury' | 'Urgent' | 'Witty' | 'Empathetic';
    preferredWords?: string[];
    bannedPhrases?: string[];
    customInstructions?: string;
}

export interface CreativeConceptOutput {
    concepts: CreativeConcept[];
}

export interface CreativeConcept {
    id: string; // Unique ID for the concept
    headline: string;
    visualIdea: string;
    primaryText: string;
    cta: string;
    imagePrompt?: string; // Prompt used to generate the image (if enabled)
    imageUrl?: string; // URL of the generated image (if enabled)
    formatPrompts: {
        feed: string;
        story: string;
        reel: string;
    };
}

export interface PromptTemplate {
    platform: 'Facebook' | 'Instagram' | 'LinkedIn' | 'TikTok';
    format: 'Feed' | 'Story' | 'Reel' | 'Carousel';
    template: string; // The raw template string
}
