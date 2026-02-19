export interface MetaBlueprintInput {
    businessName?: string;
    offerOrService: string;
    vertical: 'Local Service' | 'E-commerce' | 'SaaS' | 'Healthcare' | 'Other';
    geoTargeting: {
        center: string;
        radius: number;
        unit: 'miles' | 'km';
    };
    painPoints: string[];
    landingPageUrl?: string;
    budget?: number;
    objective?: string;
}

export interface MetaGeoTargeting {
    city: string;
    zip?: string;
    radius: number;
    unit: 'mile' | 'km';
    audienceSizeEstimate?: number;
}

export interface MetaInterestCluster {
    theme: string;
    interests: string[];
    exclusions?: string[];
    audienceSizeEstimate?: number;
    predictedIntentScore?: number;
}

export interface MetaAudience {
    type: 'Core' | 'Broad' | 'Lookalike' | 'Retargeting' | 'Custom';
    name: string;
    funnelStage: 'TOF' | 'MOF' | 'BOF';
    geo?: MetaGeoTargeting;
    interests?: MetaInterestCluster[];
    retargeting?: {
        source: 'Website' | 'Instagram' | 'Facebook' | 'Video';
        windowDays: number;
        engagementType?: 'PageView' | 'AddToCart' | 'Purchase' | 'Engaged Shopper';
        minAudienceSize?: number;
    };
    priorityScore?: number;
    audienceSizeEstimate?: number;
    exclusions?: string[];
}

export interface MetaCreative {
    name?: string;
    assetType: 'IMAGE' | 'VIDEO' | 'CAROUSEL';
    primaryText: string[];   // Max 125 chars each
    headlines: string[];     // Max 40 chars each
    descriptions?: string[]; // Max 30 chars each
    callToAction: string;
    placementAssetCustomization?: Record<string, string>;
    videoConcept?: {
        sceneDescription: string;
        hook: string;
        callToAction: string;
    };
}

export interface MetaAdSet {
    name: string;
    optimizationGoal: 'Leads' | 'Conversions' | 'Link Clicks' | 'Reach';
    budget: {
        amount: number;
        period: 'Daily' | 'Lifetime';
        strategy: 'LowestCost' | 'CostCap';
    };
    placements: string[];
    placementStrategy?: string;    // e.g. "Advantage+ Placements"
    placementRationale?: string;   // Why this strategy was chosen
    placementNotes?: string[];     // Actionable notes for the media buyer
    audience: MetaAudience;
    creatives: MetaCreative[];
    learningPhaseInfo?: {
        minDailyBudget: number;
        estimatedWeeklyEvents: number;
        status?: 'Healthy' | 'Learning Limited' | 'Risk' | 'Pending';
    };
    frequencyControl?: {
        cap: number;
        period: 'Day' | 'Week' | 'Lifetime';
    };
}

export interface MetaCampaign {
    name: string;
    objective: 'OUTCOME_LEADS' | 'OUTCOME_SALES' | 'OUTCOME_AWARENESS';
    buyingType: 'AUCTION';
    budgetOptimization: 'CBO' | 'ABO';
    totalBudget: number;
    adSets: MetaAdSet[];
}

export type MetaBudgetTier = 'CONSOLIDATE' | 'STANDARD' | 'FULL_FUNNEL';

export interface MetaBlueprintAIInsights {
    optimizations: {
        title: string;
        detail: string;
        priority: 'high' | 'medium' | 'low';
    }[];
    takeaways: string[];
    overallScore?: number;   // 0-100 agency readiness score
    scoreSummary?: string;
}

export interface MetaBlueprintOutput {
    campaignName: string;
    objective: string;
    totalBudget: number;
    structure: {
        prospecting: MetaCampaign;
        retargeting: MetaCampaign;
    };
    recommendations: {
        budgetStrategy: string;
        dailySpend: number;
        learningPhaseEstimate: string;
        warnings?: string[];
        budgetTier?: MetaBudgetTier;
    };
    aiInsights?: MetaBlueprintAIInsights;
}
