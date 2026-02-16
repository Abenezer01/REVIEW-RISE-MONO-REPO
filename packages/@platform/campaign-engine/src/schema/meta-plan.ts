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

export const MetaAudienceSchema = z.object({
    type: z.enum(['Core', 'Lookalike', 'Custom', 'Retargeting']),
    name: z.string(),
    funnelStage: z.enum(['TOF', 'MOF', 'BOF']),
    geo: GeoTargetingSchema.optional(),
    interests: z.array(MetaInterestClusterSchema).optional(),
    lookalike: z.object({
        source: z.string(), // e.g. "Purchasers 180d"
        percentage: z.number().min(1).max(10)
    }).optional(),
    retargeting: z.object({
        source: z.enum(['Website', 'Instagram', 'Facebook', 'Video']),
        windowDays: z.number().min(1).max(365),
        engagementType: z.enum(['PageView', 'AddToCart', 'Purchase', 'Engaged Shopper']).optional()
    }).optional(),
    priorityScore: z.number().min(1).max(100).optional(),
    audienceSizeEstimate: z.number().optional(), // Total estimated size for this audience
    predictedValue: z.number().optional() // Predicted ROI value
});

// --- Creative ---

export const MetaCreativeSchema = z.object({
    primaryText: z.array(z.string()), // Variations
    headlines: z.array(z.string()),
    descriptions: z.array(z.string()).optional(),
    callToAction: z.string(),
    placementAssetCustomization: z.record(z.string(), z.string()).optional() // e.g. { 'story': 'asset_id' }
});

// --- Ad Set & Campaign ---

export const MetaAdSetSchema = z.object({
    name: z.string(),
    optimizationGoal: z.enum(['Leads', 'Conversions', 'Link Clicks', 'Reach']),
    budget: z.object({
        amount: z.number(),
        period: z.enum(['Daily', 'Lifetime']),
        strategy: z.enum(['LowestCost', 'CostCap']).default('LowestCost')
    }),
    placements: z.array(z.string()), // e.g. ['feed', 'story', 'reels']
    audience: MetaAudienceSchema,
    creatives: z.array(MetaCreativeSchema),
    learningPhaseInfo: z.object({
        minDailyBudget: z.number(),
        estimatedWeeklyEvents: z.number()
    }).optional()
});

export const MetaCampaignPlanSchema = z.object({
    objective: z.enum(['OUTCOME_LEADS', 'OUTCOME_SALES', 'OUTCOME_AWARENESS']),
    buyingType: z.literal('AUCTION').default('AUCTION'),
    budgetOptimization: z.enum(['CBO', 'ABO']),
    totalBudget: z.number(),
    adSets: z.array(MetaAdSetSchema),
    summary: z.object({
        estimatedReach: z.number().optional(),
        estimatedConversions: z.number().optional(),
        recommendedBudget: z.string().optional()
    })
});

export type MetaCampaignPlan = z.infer<typeof MetaCampaignPlanSchema>;
export type MetaAdSet = z.infer<typeof MetaAdSetSchema>;
export type MetaAudience = z.infer<typeof MetaAudienceSchema>;
export type MetaInterestCluster = z.infer<typeof MetaInterestClusterSchema>;
export type MetaCreative = z.infer<typeof MetaCreativeSchema>;

export const MetaBlueprintSchema = z.object({
    campaignName: z.string(),
    objective: z.string(),
    totalBudget: z.number(),
    structure: z.object({
        prospecting: z.object({
            audiences: z.array(MetaAudienceSchema),
            adSets: z.array(MetaAdSetSchema)
        }),
        retargeting: z.object({
            audiences: z.array(MetaAudienceSchema),
            adSets: z.array(MetaAdSetSchema)
        })
    }),
    recommendations: z.object({
        budgetStrategy: z.string(), // CBO vs ABO
        dailySpend: z.number(),
        learningPhaseEstimate: z.string()
    })
});

export type MetaBlueprint = z.infer<typeof MetaBlueprintSchema>;
