import { llmService } from './llm.service';
import OpenAI from 'openai'; // Still needed for DALL-E direct call if kept here

import { GenerateScriptRequest, GenerateScriptResponse } from '@platform/contracts';

export class ContentStudioService {
    // Kept for DALL-E specific logic
    private getOpenAI() {
        const apiKey = process.env.OPENAI_API_KEY || process.env.LLM_PROVIDER_API_KEY;
        if (!apiKey) {
            throw new Error('OPENAI_API_KEY or LLM_PROVIDER_API_KEY is not set');
        }
        return new OpenAI({ apiKey });
    }

    async generateCaptions(platform: string, description: string, tone: string) {
        const prompt = `Generate 3 social media captions for ${platform}.
        Topic/Description: "${description}"
        Tone: ${tone}
        
        Return a JSON object with a "captions" array, where each item is a string.`;

        return llmService.generateJSON(prompt);
    }

    async generateHashtags(topic: string, location: string, platform: string, niche?: string, audience?: string) {
        const prompt = `Generate highly effective, viral hashtags for a social media post on ${platform}.
        
        Context:
        - Niche/Industry: ${niche || 'General'}
        - Target Audience: ${audience || 'General Public'}
        - Content Description/Topic: "${topic}"
        ${location !== 'Global' ? `- Location: ${location}` : ''}
        
        Group the hashtags into three distinct categories:
        1. "core": Broad, high-volume tags related to the general niche (${niche}).
        2. "niche": Specific, targeted tags for the audience (${audience}) and specific topic.
        3. "local": Community-focused or trending tags (if appropriate, otherwise use this for 'Trending' or 'Community' tags).

        Return a generic JSON object with keys: "niche", "local", "core". Each should be an array of strings (hashtags).`;

        return llmService.generateJSON(prompt);
    }

    async generatePostIdeas(businessType: string, goal: string) {
        const prompt = `Generate 10 social media post ideas for a ${businessType} with the goal of "${goal}".
        Return JSON with an "ideas" array. Each idea should have: "title", "description", "platform" (suggested).`;

        return llmService.generateJSON(prompt);
    }

    async generate30DayPlan(topic: string, businessType: string) {
        const prompt = `Create a 30-day social media content calendar for a ${businessType} focusing on "${topic}".
        Return JSON with a "days" array. Each day should have: "day" (1-30), "topic", "contentType" (Reel, Post, Carousel, etc.), "platform".`;

        return llmService.generateJSON(prompt);
    }

    async generateImagePrompt(postIdea: string) {
        const prompt = `Create 3 distinct AI image generation prompts for a social media post about: "${postIdea}".
        Return JSON with a "prompts" array. Each prompt object: "prompt", "style", "aspectRatio".`;

        return llmService.generateJSON(prompt);
    }

    async generatePromptIdeas(topic: string, category?: string, mood?: string, style?: string) {
        const categoryContext = category ? `Category: ${category}` : '';
        const moodContext = mood ? `Mood/Atmosphere: ${mood}` : '';
        const styleContext = style ? `Art Style: ${style}` : '';

        const prompt = `You are an expert AI image prompt engineer. Generate 5 detailed, creative image generation prompts based on the following:

Topic/Idea: "${topic}"
${categoryContext}
${moodContext}
${styleContext}

Each prompt should be:
- Highly detailed and descriptive
- Optimized for DALL-E 3 image generation
- Include specific details about composition, lighting, colors, mood, and style
- Be creative and varied in approach

Return a JSON object with a "prompts" array. Each item should have:
- "prompt": The detailed image generation prompt (string)
- "title": A short, catchy title for this prompt idea (string)
- "tags": Array of 2-3 relevant tags (array of strings)

Example format:
{
  "prompts": [
    {
      "title": "Golden Hour Cityscape",
      "prompt": "A futuristic cityscape at golden hour, neon lights reflecting on wet streets, cyberpunk aesthetic, dramatic lighting, high detail, cinematic composition",
      "tags": ["cityscape", "futuristic", "dramatic"]
    }
  ]
}`;

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

    async generateCarousel(topic: string) {
        const prompt = `Create a 5-8 slide carousel outline for "${topic}".
        Return JSON with "slides" array. Each slide: "slideNumber", "title", "text", "visualDescription".`;

        return llmService.generateJSON(prompt);
    }

    async generateScript(params: GenerateScriptRequest): Promise<GenerateScriptResponse> {
        const { 
            videoTopic, 
            videoGoal, 
            targetAudience, 
            tone = 'professional', 
            duration = 30,
            includeCallToAction
        } = params;

        const numScenes = duration <= 15 ? 2 : duration <= 30 ? 3 : duration <= 60 ? 4 : Math.min(Math.ceil(duration / 20), 10);

        const prompt = `Create a ${duration}-second video script about: ${videoTopic}

${videoGoal ? `Goal: ${videoGoal}` : ''}
${targetAudience ? `Audience: ${targetAudience}` : ''}
Tone: ${tone}

Return ONLY valid JSON in this exact format:
{
  "script": {
    "scenes": [
      {
        "title": "Hook - Opening Shot",
        "description": "Close-up of product with dynamic lighting",
        "voiceover": "What the narrator says in this scene",
        "timestamp": "0:00 - 0:05"
      }
    ]
  }
}

Create exactly ${numScenes} scenes. ${includeCallToAction ? 'Include a call-to-action in the final scene.' : ''} Make the voiceover engaging and concise.`;

        return llmService.generateJSON(prompt);
    }

    async generateVideoScript(topic: string, duration: string, platform: string) {
        const prompt = `Write a short video script for a ${platform} ${duration} video about "${topic}".
        Return JSON: { "title": "", "hook": "", "body": "", "cta": "", "visualNotes": "" }`;

        return llmService.generateJSON(prompt);
    }
}

export const contentStudioService = new ContentStudioService();
