export const CREATIVE_ENGINE_PROMPTS = {
    GENERATE_CONCEPTS: (input: any) => `
You are a world-class creative director and copywriter.
Your goal is to generate ${input.quantity || 3} distinct creative concepts for a marketing campaign.

INPUTS:
- Offer/Product: "${input.offer}"
- Target Audience: "${input.audience}"
- Pain Points: ${input.painPoints.join(', ')}
- Brand Tone: ${input.tone.toneType} ${input.tone.customInstructions ? `(${input.tone.customInstructions})` : ''}
${input.tone.preferredWords?.length ? `- Preferred Words: ${input.tone.preferredWords.join(', ')}` : ''}
${input.tone.bannedPhrases?.length ? `- Banned Phrases: ${input.tone.bannedPhrases.join(', ')}` : ''}

INSTRUCTIONS:
1. Analyze the inputs to understand the core message and emotional hook.
2. Develop 3 distinct concepts. Each concept should have a unique "angle" (e.g., Fear of Missing Out, Social Proof, Problem/Solution, Aspirational).
3. The tone must be strictly followed. If "Luxury", use elegant language. If "Urgent", use punchy, action-oriented language.
4. For each concept, provide:
   - Headline: Catchy, under 50 chars.
   - Visual Idea: A description of the image/video to accompany the text.
   - Primary Text: The main body copy (125 chars max).
   - CTA: A strong Call to Action.
   - Image Prompt: A detailed DALL-E prompt to generate the visual idea.
   - Format Prompts: Specific copy adaptations for Feed, Story, and Reel.

OUTPUT FORMAT:
Return a JSON object with this exact structure:
{
  "concepts": [
    {
      "headline": "...",
      "visualIdea": "...",
      "primaryText": "...",
      "cta": "...",
      "imagePrompt": "...",
      "formatPrompts": {
        "feed": "...",
        "story": "...",
        "reel": "..."
      }
    }
  ]
}
`,
    FORMAT_TEMPLATES: {
        FEED: (concept: any) => `Write a Facebook Feed post using this concept: "${concept.headline}". Focus on "${concept.visualIdea}". Keep it under 280 characters. Include hashtags.`,
        STORY: (concept: any) => `Write a 3-frame Instagram Story script for this concept: "${concept.headline}". Frame 1: Hook. Frame 2: Value. Frame 3: CTA.`,
        REEL: (concept: any) => `Write a 30-second Instagram Reel script for this concept: "${concept.headline}". Include visual cues and voiceover text.`
    }
};
