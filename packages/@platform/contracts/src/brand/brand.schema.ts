import { z } from 'zod';

export const BrandDNASchema = z.object({
    values: z.array(z.string()),
    voice: z.string().optional(),
    audience: z.string().optional(),
    mission: z.string().optional(),
});

export const BrandProfileSchema = z.object({
    name: z.string().min(1),
    website: z.string().url().optional().nullable(),
    industry: z.string().optional().nullable(),
    description: z.string().optional().nullable(),
});

export const BrandOverviewQuerySchema = z.object({
    id: z.string().uuid(),
});

export const BrandVisibilityQuerySchema = z.object({
    range: z.enum(['7d', '30d', '90d']).default('30d'),
});

export const CompetitorSchema = z.object({
    name: z.string().min(1),
    website: z.string().url(),
});

export const UpdateCompetitorSchema = CompetitorSchema.partial();

export const BrandContentSchema = z.object({
    title: z.string().min(1),
    body: z.string().min(1),
    platform: z.string().optional(),
    status: z.string().optional(),
});

export const UpdateBrandContentSchema = BrandContentSchema.partial();

export const ScheduledPostSchema = z.object({
    content: z.union([
        z.string().min(1),
        z.object({
            title: z.string().optional(),
            text: z.string(),
            hashtags: z.string().optional(),
            media: z.array(z.any()).optional(),
        })
    ]),
    scheduledAt: z.string().datetime(),
    platforms: z.array(z.string()),
});

export const UpdateScheduledPostSchema = ScheduledPostSchema.partial();

export const StudioDraftSchema = z.object({
    type: z.string(),
    content: z.any(),
});
