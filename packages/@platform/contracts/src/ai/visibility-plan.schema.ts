import { z } from 'zod';

/**
 * Visibility Plan Schema
 * Defines the structure for a 30-day visibility improvement plan
 */
export const VisibilityPlanSchema = z.object({
    title: z.string(),
    overview: z.string(),
    goals: z.array(z.object({
        metric: z.string(),
        current: z.number(),
        target: z.number(),
        timeframe: z.string(),
    })),
    weeks: z.array(z.object({
        weekNumber: z.number(),
        focus: z.string(),
        tasks: z.array(z.object({
            title: z.string(),
            description: z.string(),
            category: z.string(),
            estimatedHours: z.number(),
        })),
    })),
    expectedOutcomes: z.array(z.string()),
});

export type VisibilityPlan = z.infer<typeof VisibilityPlanSchema>;
