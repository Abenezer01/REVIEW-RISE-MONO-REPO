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
/**
 * Validated Input for the Campaign Engine.
 */
export const CampaignInputSchema = z.object({
    vertical: z.enum([
        'Local Service', 'E-commerce', 'SaaS', 'Restaurant', 'Healthcare', 'Real Estate', 'Legal', 'Other'
    ] as [VerticalType, ...VerticalType[]]),
    objective: CampaignObjectiveSchema,
    budget: z.number().positive(),
    currency: z.string().default('USD'),

    // Identity & Context (New in v4)
    businessName: z.string(),
    websiteUrl: z.string().url().optional(),
    services: z.array(z.string()).min(1),
    offer: z.string().min(5),
    painPoints: z.array(z.string()).optional(),
    landingPageUrl: z.string().url().optional(),
    geo: z.string().min(2), // e.g. "Austin, TX" or "United States"

    // Advanced Configuration (New in v4)
    expectedAvgCpc: z.number().positive().optional(),
    conversionTrackingEnabled: z.boolean().default(true),
    competitorUrls: z.array(z.string().url()).optional(),
    keywordsPerAdGroup: z.number().int().min(5).max(50).optional(), // Configurable chunk size (default: 20)
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

// --- v4 Engine Schemas ---

export const KeywordClusterSchema = z.object({
    clusterName: z.string(),
    funnelStage: z.enum(['TOF', 'MOF', 'BOF']),
    intentType: z.enum(['Problem', 'Service', 'Brand', 'Competitor', 'Emergency']),
    keywords: z.array(z.string()),
    matchTypes: z.array(z.enum(['Exact', 'Phrase', 'Broad'])),
    intentStrength: z.number().min(1).max(10)
});

export const AdGroupSchema = z.object({
    adGroupName: z.string(),
    funnelStage: z.enum(['TOF', 'MOF', 'BOF']),
    keywords: z.array(z.string()),
    rsaAssets: z.object({
        headlines: z.array(z.string()),
        descriptions: z.array(z.string()),
    }),
    extensions: z.array(z.string()).optional(), // Generic list for now
    budgetAllocation: z.object({
        percentage: z.number(),
        amount: z.number(),
        estimatedClicks: z.number(),
        estimatedConversions: z.number(),
        estimatedCpa: z.number(),
        learningPhaseStatus: z.enum(['Healthy', 'Risk', 'Starved'])
    }).optional() // Budget allocation (added by budget allocator)
});

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
 * The Master Plan V4 Output.
 */
export const CampaignPlanSchema = z.object({
    summary: z.object({
        goal: z.string(),
        totalBudget: z.number(),
        vertical: z.string(),
        clickCapacity: z.number().optional(), // New
        budgetTier: z.string().optional(), // New
        recommendedCampaignCount: z.number().optional(),
        bidStrategy: z.string().optional(),
        avgCpc: z.number().optional(), // For UI transparency
    }),
    // Legacy support
    channels: z.array(ChannelDistributionSchema),
    campaigns: z.array(CampaignNodeSchema),
    execution_steps: z.array(z.string()),
    optimization_schedule: z.array(z.string()),
    warnings: z.array(z.string()),

    // v4 Output
    keywordClusters: z.array(KeywordClusterSchema).optional(),
    negativeKeywords: z.array(z.string()).optional(),
    adGroups: z.array(AdGroupSchema).optional(),
    landingPageAnalysis: z.object({
        score: z.number(),
        mobileOptimized: z.boolean(),
        trustSignalsDetected: z.array(z.string()),
        warnings: z.array(z.string()),

        // New Strategy Metrics
        qualityScorePrediction: z.number(),
        conversionReadinessScore: z.number(),
        frictionScore: z.number(),
        recommendations: z.array(z.string()),
        landingPageType: z.enum(['lead_gen', 'ecommerce', 'homepage', 'informational']),
        adToLandingConsistencyScore: z.number()
    }).optional(),
    performanceAssumptions: z.object({
        ctr: z.string(),
        cpc: z.string(),
        cvr: z.string(),
    }).optional()
});

export type CampaignPlan = z.infer<typeof CampaignPlanSchema>;
