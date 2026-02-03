/**
 * Prompt templates for Content Studio AI generation
 * Centralized prompt management for easier maintenance and updates
 */

export const PROMPTS = {
    CAPTIONS: {
        GENERATE: (platform: string, description: string, tone: string) => `You are an expert social media content creator.

TASK: Generate 3 engaging social media captions for ${platform}.

CONTEXT:
- Topic/Description: "${description}"
- Tone: ${tone}

REQUIREMENTS:
- Create 3 distinct caption variations
- Match the specified tone
- Make captions engaging and platform-appropriate
- Include emojis if suitable for the platform

OUTPUT FORMAT:
Return valid JSON with this structure:
{
  "captions": ["Caption 1", "Caption 2", "Caption 3"]
}`
    },

    HASHTAGS: {
        GENERATE: (topic: string, location: string, platform: string, niche?: string, audience?: string) => `You are a social media hashtag strategist.

TASK: Generate highly effective, optimized hashtags for a ${platform} post.

CONTEXT:
- Niche/Industry: ${niche || 'General'}
- Target Audience: ${audience || 'General Public'}
- Topic: "${topic}"
${location !== 'Global' ? `- Location: ${location}` : ''}

REQUIREMENTS:
- Generate 20-30 total hashtags
- Group into three strategic categories:
  1. "core": Broad, high-volume tags for maximum reach
  2. "niche": Specific, targeted tags for the audience and topic
  3. "local": Location-based or trending community tags
- Ensure hashtags are relevant and currently active
- Mix of popular and niche tags for optimal discoverability

OUTPUT FORMAT:
Return valid JSON with this structure:
{
  "core": ["#tag1", "#tag2", ...],
  "niche": ["#tag3", "#tag4", ...],
  "local": ["#tag5", "#tag6", ...]
}`
    },

    IDEAS: {
        GENERATE: (businessType: string, goal: string, tone?: string, platform?: string) => `You are a creative social media strategist.

TASK: Generate 10 unique content ideas for a ${businessType}.

CONTEXT:
- Platform: ${platform || 'Social media'}
- Goal: "${goal}"
${tone ? `- Tone: ${tone}` : ''}

REQUIREMENTS:
- Create 10 diverse, actionable post ideas
- Each idea should support the specified goal
- Include variety in content types (Reels, Carousels, Stories, Posts, etc.)
- Make ideas specific and implementable

OUTPUT FORMAT:
Return valid JSON with this structure:
{
  "ideas": [
    {
      "title": "Idea title",
      "description": "Detailed description",
      "platform": "Suggested platform",
      "tone": "Suggested tone"
    },
    ...
  ]
}`
    },

    PLAN: {
    GENERATE_30DAY: (topic: string, businessType: string, context?: any) => {
        const brandDNA = context?.brandDNA || {};
        const audience = brandDNA.audience || 'General Public';
        const voice = brandDNA.voice || 'Professional and engaging';
        const mission = brandDNA.mission || '';
        const seasonalEvents = context?.seasonalEvents || [];

        let seasonalContext = '';
         if (seasonalEvents.length > 0) {
             seasonalContext = `\nCRITICAL SEASONAL EVENTS (MANDATORY):\n${seasonalEvents.map((e: any) => `- Day ${e.day}: ${e.name} - ${e.description || 'No description'}`).join('\n')}\n`;
         }

         return `You are a world-class social media strategist. Create a high-converting 30-day social media content calendar for a ${businessType} focusing on the theme: "${topic}".
        
        Brand Context:
        - Target Audience: ${audience}
        - Brand Voice/Tone: ${voice}
        ${mission ? `- Brand Mission: ${mission}` : ''}
        ${seasonalContext}
        Strategic Guidelines:
        - MANDATORY REQUIREMENT: For EVERY day listed in the "CRITICAL SEASONAL EVENTS" section above, you MUST create a post that is 100% focused on that specific event. For example, if March 8 is International Women's Day, Day 8 MUST be about International Women's Day.
        - For seasonal posts, set the "seasonalHook" field to the name of the event (e.g., "International Women's Day").
        - Mix content types for other days (Educational, Entertaining, Inspirational, Promotional).
        - Ensure a logical flow that builds trust and authority over the 30 days.
        - Each post should feel authentic to the brand voice.
        - Use hooks that stop the scroll for the specific target audience.

        Return JSON with a "days" array. Each day should have:
        - "day": (integer 1-30)
        - "topic": (A catchy title for the post)
        - "contentType": (e.g., "Reel", "Carousel", "Single Post", "Story", "Educational Thread")
        - "platform": (e.g., "Instagram", "Facebook", "LinkedIn", "X")
        - "contentIdea": (A detailed description of the post concept)
        - "suggestedCopy": (A draft of the actual caption or script including emojis and relevant hooks)
        - "seasonalHook": (If this is a seasonal event post, include the event name here, otherwise leave null)
        `;
    },
    },

    IMAGE: {
        GENERATE_PROMPT: (postIdea: string) => `You are an AI image prompt engineer.

TASK: Create 3 distinct image generation prompts for a social media post.

CONTEXT:
- Post Idea: "${postIdea}"

REQUIREMENTS:
- Generate 3 varied, creative prompts
- Each prompt should be detailed and descriptive
- Optimized for AI image generation (DALL-E, Midjourney, etc.)
- Include composition, lighting, and mood details
- Specify appropriate style and aspect ratio

OUTPUT FORMAT:
Return valid JSON with this structure:
{
  "prompts": [
    {
      "prompt": "Detailed image generation prompt",
      "style": "Photorealistic/Digital Art/3D Render/etc.",
      "aspectRatio": "16:9/1:1/9:16/etc."
    },
    ...
  ]
}`,

        GENERATE_IDEAS: (topic: string, category?: string, mood?: string, style?: string) => `You are an expert AI image prompt engineer.

TASK: Generate 5 detailed, creative image generation prompts.

CONTEXT:
- Topic/Idea: "${topic}"
${category ? `- Category: ${category}` : ''}
${mood ? `- Mood/Atmosphere: ${mood}` : ''}
${style ? `- Art Style: ${style}` : ''}

REQUIREMENTS:
- Create 5 unique, highly detailed prompts
- Optimize for DALL-E 3 image generation
- Include specific details about:
  * Composition and framing
  * Lighting and atmosphere
  * Colors and mood
  * Style and artistic approach
- Be creative and varied in each prompt
- Each prompt should be distinct from the others

OUTPUT FORMAT:
Return valid JSON with this structure:
{
  "prompts": [
    {
      "title": "Short, catchy title",
      "prompt": "Detailed image generation prompt with composition, lighting, colors, mood, and style details",
      "tags": ["tag1", "tag2", "tag3"]
    },
    ...
  ]
}

Example:
{
  "prompts": [
    {
      "title": "Golden Hour Cityscape",
      "prompt": "A futuristic cityscape at golden hour, neon lights reflecting on wet streets, cyberpunk aesthetic, dramatic lighting, high detail, cinematic composition",
      "tags": ["cityscape", "futuristic", "dramatic"]
    }
  ]
}`
    },

    CAROUSEL: {
        GENERATE: (topic: string, tone?: string, platform?: string) => `You are a social media carousel designer.

TASK: Create a compelling 5-8 slide carousel for ${platform || 'Instagram'}.

CONTEXT:
- Topic: "${topic}"
${tone ? `- Tone: ${tone}` : ''}

REQUIREMENTS:
- Design 5-8 slides total
- First slide should be an attention-grabbing hook
- Last slide should include a call-to-action
- Each slide should have concise, impactful text
- Include visual descriptions for designers
- Ensure logical flow between slides

OUTPUT FORMAT:
Return valid JSON with this structure:
{
  "slides": [
    {
      "slideNumber": 1,
      "title": "Slide title",
      "text": "Main text content",
      "visualDescription": "Description of visual elements"
    },
    ...
  ]
}`
    },

    SCRIPT: {
        GENERATE_VIDEO: (params: {
            videoTopic: string;
            duration: number;
            platform: string;
            tone: string;
            videoGoal?: string;
            targetAudience?: string;
            numScenes: number;
            includeCallToAction?: boolean;
        }) => `You are a professional video script writer.

TASK: Create a ${params.duration}-second video script for ${params.platform}.

CONTEXT:
- Topic: ${params.videoTopic}
${params.videoGoal ? `- Goal: ${params.videoGoal}` : ''}
${params.targetAudience ? `- Target Audience: ${params.targetAudience}` : ''}
- Tone: ${params.tone}

REQUIREMENTS:
- Create exactly ${params.numScenes} scenes
- First scene must hook the viewer immediately
${params.includeCallToAction ? '- Final scene must include a clear call-to-action' : ''}
- Each scene should have:
  * Descriptive title
  * Visual description for filming
  * Engaging voiceover text
  * Timestamp for pacing
- Keep voiceover concise and impactful
- Ensure smooth flow between scenes

OUTPUT FORMAT:
Return ONLY valid JSON in this exact structure:
{
  "script": {
    "scenes": [
      {
        "title": "Hook - Opening Shot",
        "description": "Close-up of product with dynamic lighting",
        "voiceover": "What the narrator says in this scene",
        "timestamp": "0:00 - 0:05"
      },
      ...
    ]
  }
}`,

        GENERATE_SHORT: (topic: string, duration: string, platform: string) => `You are a professional video script writer.

TASK: Write a compelling ${duration} video script for ${platform}.

CONTEXT:
- Topic: "${topic}"
- Platform: ${platform}
- Duration: ${duration}

REQUIREMENTS:
- Create an attention-grabbing hook
- Develop engaging body content
- Include a clear call-to-action
- Add visual notes for production
- Keep content concise and platform-appropriate

OUTPUT FORMAT:
Return valid JSON with this structure:
{
  "title": "Video title",
  "hook": "Opening hook text",
  "body": "Main content",
  "cta": "Call-to-action",
  "visualNotes": "Notes for visual production"
}`
    },

    POST: {
        GENERATE_COMPLETE: (params: {
            platform: string;
            topic: string;
            tone: string;
            goal: string;
            audience: string;
            language: string;
            length: string;
            brandContext?: string;
        }) => `You are an expert social media manager and content creator.

TASK: Create a complete, cohesive social media post package for ${params.platform}.
${params.brandContext || ''}
CONTEXT:
- Topic/Content: "${params.topic}"
- Target Audience: "${params.audience}"
- Goal: "${params.goal}"
- Tone: "${params.tone}"
- Language: "${params.language}"
- Caption Length: "${params.length}"

REQUIREMENTS:
Generate ALL of the following components:

1. PRIMARY CAPTION:
   - Create an engaging, ${params.length}-length caption
   - Match the specified tone and brand voice
   - Include emojis if appropriate for the platform
   - Write in ${params.language}

2. HASHTAGS (30 total):
   - "highVolume": 10 broad, high-reach hashtags
   - "niche": 10 targeted, specific hashtags
   - "branded": 10 brand/campaign-specific hashtags

3. CONTENT IDEAS (4 ideas):
   - Generate 4 distinctive follow-up content ideas
   - Vary content types (Carousel, Reel, Story, Infographic, etc.)
   - Each idea should complement the main post

4. IMAGE PROMPT:
   - Create a detailed AI image generation prompt
   - Describe composition, lighting, mood, and style
   - Optimize for high-quality social media visuals

OUTPUT FORMAT:
Return ONLY valid JSON with this exact structure:
{
  "caption": "The main caption text with emojis...",
  "hashtags": {
    "highVolume": ["#tag1", "#tag2", ...],
    "niche": ["#tag3", "#tag4", ...],
    "branded": ["#tag5", ...]
  },
  "contentIdeas": [
    {
      "type": "Content Type (e.g., Carousel, Reel)",
      "title": "Idea title",
      "description": "Brief description of the content"
    },
    ...
  ],
  "imagePrompt": "A detailed AI image generation prompt with composition, lighting, mood, and style details..."
}`
    }
};
