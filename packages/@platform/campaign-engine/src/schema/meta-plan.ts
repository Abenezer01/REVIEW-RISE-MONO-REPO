import { z } from 'zod';

// --- Audience & Targeting ---

export const GeoTargetingSchema = z.object({
    city: z.string(),
    zip: z.string().optional(),
    radius: z.number().min(1).max(500), // Miles (Meta max is 500)
    unit: z.enum(['mile', 'km']).default('mile'),
    audienceSizeEstimate: z.number().optional()
});

export const MetaInterestClusterSchema = z.object({
    theme: z.string(), // e.g. "Competitors"
    interests: z.array(z.string()),
    exclusions: z.array(z.string()).optional(),
    audienceSizeEstimate: z.number().optional(),
    predictedIntentScore: z.number().min(1).max(10).optional() // 1-10 Score
});

// Advanced structure: Core and Broad are separate types
export const MetaAudienceTypeSchema = z.enum(['Core', 'Broad', 'Lookalike', 'Custom', 'Retargeting']);

export const MetaAudienceSchema = z.object({
    type: MetaAudienceTypeSchema,
    name: z.string(),
    funnelStage: z.enum(['TOF', 'MOF', 'BOF']),
    geo: GeoTargetingSchema.optional(),
    interests: z.array(MetaInterestClusterSchema).optional(),
    exclusions: z.array(z.string()).optional(), // Global exclusions
    lookalike: z.object({
        source: z.string(), // e.g. "Purchasers 180d"
        percentage: z.number().min(1).max(10)
    }).optional(),
    retargeting: z.object({
        source: z.enum(['Website', 'Instagram', 'Facebook', 'Video']),
        windowDays: z.number().min(1).max(365),
        engagementType: z.enum(['PageView', 'AddToCart', 'Purchase', 'Engaged Shopper']).optional(),
        minAudienceSize: z.number().optional() // Guardrail
    }).optional(),
    priorityScore: z.number().min(1).max(100).optional(),
    audienceSizeEstimate: z.number().optional(), // Total estimated size for this audience
    predictedValue: z.number().optional() // Predicted ROI value
});

// --- Creative ---

export const MetaAssetTypeSchema = z.enum(['IMAGE', 'VIDEO', 'CAROUSEL']);

export const MetaCreativeSchema = z.object({
    name: z.string(),
    assetType: MetaAssetTypeSchema.default('IMAGE'),
    primaryText: z.array(z.string().max(125)), // Strict limit: 125 chars
    headlines: z.array(z.string().max(40)), // Strict limit: 40 chars
    descriptions: z.array(z.string().max(30)).optional(),
    callToAction: z.string(),
    placementAssetCustomization: z.record(z.string(), z.string()).optional() // e.g. { 'story': 'asset_id' }
});

// --- Ad Set & Campaign ---

export const MetaBudgetSchema = z.object({
    amount: z.number(),
    period: z.enum(['Daily', 'Lifetime']),
    strategy: z.enum(['LowestCost', 'CostCap']).default('LowestCost')
});

export const MetaAdSetSchema = z.object({
    name: z.string(),
    optimizationGoal: z.enum(['Leads', 'Conversions', 'Link Clicks', 'Reach']),
    budget: MetaBudgetSchema,
    placements: z.array(z.string()),
    placementStrategy: z.string().optional(),   // e.g. "Advantage+ Placements"
    placementRationale: z.string().optional(),  // Why this strategy
    placementNotes: z.array(z.string()).optional(), // Actionable notes for media buyer
    audience: MetaAudienceSchema,
    creatives: z.array(MetaCreativeSchema),
    learningPhaseInfo: z.object({
        minDailyBudget: z.number(),
        estimatedWeeklyEvents: z.number(),
        status: z.enum(['Healthy', 'Learning Limited', 'Risk', 'Pending']).default('Pending')
    }).optional()
});

export const MetaCampaignSchema = z.object({
    name: z.string(),
    objective: z.enum(['OUTCOME_LEADS', 'OUTCOME_SALES', 'OUTCOME_AWARENESS']),
    buyingType: z.literal('AUCTION').default('AUCTION'),
    budgetOptimization: z.enum(['CBO', 'ABO']), // Key strictness
    totalBudget: z.number(),
    adSets: z.array(MetaAdSetSchema)
});

// Root Plan Object
export const MetaBlueprintSchema = z.object({
    campaignName: z.string(),
    objective: z.string(),
    totalBudget: z.number(),
    structure: z.object({
        prospecting: MetaCampaignSchema, // The Cold Campaign
        retargeting: MetaCampaignSchema  // The Warm Campaign
    }),
    recommendations: z.object({
        budgetStrategy: z.string(),
        dailySpend: z.number(),
        learningPhaseEstimate: z.string(),
        warnings: z.array(z.string()).optional(),
        budgetTier: z.enum(['CONSOLIDATE', 'STANDARD', 'FULL_FUNNEL']).optional()
    })
});

export type MetaBlueprint = z.infer<typeof MetaBlueprintSchema>;
export type MetaCampaign = z.infer<typeof MetaCampaignSchema>;
export type MetaAdSet = z.infer<typeof MetaAdSetSchema>;
export type MetaAudience = z.infer<typeof MetaAudienceSchema>;
export type MetaInterestCluster = z.infer<typeof MetaInterestClusterSchema>;
export type MetaCreative = z.infer<typeof MetaCreativeSchema>;
