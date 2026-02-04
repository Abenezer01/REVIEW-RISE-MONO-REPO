import { z } from 'zod';
import { VerticalType } from '../config/vertical-profiles';

export const CampaignObjectiveSchema = z.enum([
    'Leads',
    'Awareness',
    'Sales',
    'Local Visits'
]);

export type CampaignObjective = z.infer<typeof CampaignObjectiveSchema>;

/**
 * Validated Input for the Campaign Engine.
 */
export const CampaignInputSchema = z.object({
    vertical: z.enum([
        'Local Service', 'E-commerce', 'SaaS', 'Restaurant', 'Healthcare'
    ] as [VerticalType, ...VerticalType[]]),
    objective: CampaignObjectiveSchema,
    budget: z.number().positive(),
    currency: z.string().default('USD'),
    brandName: z.string().optional(),
});

export type CampaignInput = z.infer<typeof CampaignInputSchema>;

/**
 * Represents a single marketing channel's allocation.
 */
export const ChannelDistributionSchema = z.object({
    channel: z.enum(['Google Search', 'Meta (Facebook/Instagram)', 'LinkedIn', 'TikTok']),
    allocationPercentage: z.number().min(0).max(1),
    budget: z.number(),
    rationale: z.string()
});

export type ChannelDistribution = z.infer<typeof ChannelDistributionSchema>;

export const CampaignNodeSchema = z.object({
    name: z.string(),
    objective: z.string(),
    budget: z.number(),
    description: z.string(),
    targeting: z.object({
        audiences: z.array(z.string()).optional(),
        keywords: z.array(z.string()).optional(),
        geo: z.string().optional(),
    }),
    stage: z.enum(['Awareness', 'Consideration', 'Conversion'])
});

export type CampaignNode = z.infer<typeof CampaignNodeSchema>;

/**
 * The Master Plan V1 Output.
 * Contains the strategy summary, specific campaigns, and execution guide.
 */
export const CampaignPlanSchema = z.object({
    summary: z.object({
        goal: z.string(),
        totalBudget: z.number(),
        vertical: z.string(),
        funnelSplit: z.object({
            awareness: z.number(),
            consideration: z.number(),
            conversion: z.number()
        })
    }),
    channels: z.array(ChannelDistributionSchema),
    campaigns: z.array(CampaignNodeSchema),
    execution_steps: z.array(z.string()),
    optimization_schedule: z.array(z.string()),
    warnings: z.array(z.string())
});

export type CampaignPlan = z.infer<typeof CampaignPlanSchema>;
