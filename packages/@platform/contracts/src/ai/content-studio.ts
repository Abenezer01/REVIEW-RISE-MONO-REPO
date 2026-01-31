import { z } from 'zod';

export const CaptionRequestSchema = z.object({
  platform: z.string(),
  description: z.string(),
  tone: z.string()
});

export const HashtagRequestSchema = z.object({
  niche: z.string().optional(),
  audience: z.string().optional(),
  description: z.string().optional(),
  platform: z.string().optional()
});

export const IdeaRequestSchema = z.object({
  businessType: z.string(),
  goal: z.string(),
  tone: z.string().optional().default('professional'),
  platform: z.string().optional().default('Instagram')
});

export const PlanRequestSchema = z.object({
  topic: z.string(),
  businessType: z.string()
});

export const ImagePromptRequestSchema = z.object({
  postIdea: z.string()
});

export const PromptIdeaRequestSchema = z.object({
  topic: z.string(),
  category: z.string().optional(),
  mood: z.string().optional(),
  style: z.string().optional()
});

export const ImageGenerationRequestSchema = z.object({
  prompt: z.string(),
  style: z.string().optional().default('Photorealistic'),
  quality: z.string().optional().default('high'),
  aspectRatio: z.string().optional().default('16:9'),
  variations: z.number().optional().default(1)
});

export const CarouselRequestSchema = z.object({
  topic: z.string(),
  tone: z.string().optional().default('professional'),
  platform: z.string().optional().default('Instagram')
});

export const ScriptRequestSchema = z.object({
  videoTopic: z.string(),
  videoGoal: z.string().optional(),
  targetAudience: z.string().optional(),
  tone: z.string().optional().default('professional'),
  platform: z.string().optional().default('Instagram'),
  duration: z.number().optional().default(30),
  includeSceneDescriptions: z.boolean().optional().default(true),
  includeVisualSuggestions: z.boolean().optional().default(true),
  includeBRollRecommendations: z.boolean().optional().default(false),
  includeCallToAction: z.boolean().optional().default(true)
});

export type GenerateScriptRequest = z.infer<typeof ScriptRequestSchema>;

export interface ScriptScene {
  title?: string;
  description?: string;
  content?: string;
  voiceover?: string;
  timestamp?: string;
}

export interface ScriptData {
  scenes: ScriptScene[];
}

export interface GenerateScriptResponse {
  script: ScriptData;
}
