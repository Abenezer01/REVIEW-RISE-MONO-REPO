import { z } from 'zod';

/**
 * Recommendation Schema
 * Defines the structure for a single AI-generated recommendation
 */
export const RecommendationSchema = z.object({
    category: z.enum(['search', 'local', 'social', 'reputation', 'conversion', 'content']),
    title: z.string().min(10).max(200),
    description: z.string().min(50).max(2000),
    why: z.array(z.string()).min(1).max(5),
    steps: z.array(z.string()).min(1).max(10),
    impact: z.enum(['low', 'medium', 'high', 'critical']),
    effort: z.enum(['low', 'medium', 'high']),
    confidence: z.number().min(0).max(100),
    kpiTarget: z.object({
        metric: z.string(),
        target: z.number(),
        timeframe: z.string(),
    }).optional(),
});

/**
 * Recommendations Output Schema
 * Defines the structure for AI output containing multiple recommendations
 */
export const RecommendationsOutputSchema = z.object({
    recommendations: z.array(RecommendationSchema).min(3).max(25),
    summary: z.string().optional(),
});

export type RecommendationInput = z.infer<typeof RecommendationSchema>;
export type RecommendationsOutput = z.infer<typeof RecommendationsOutputSchema>;
