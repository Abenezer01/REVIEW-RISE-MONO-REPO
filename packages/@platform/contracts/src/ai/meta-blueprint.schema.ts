export interface MetaBlueprintInput {
    businessName?: string;
    offerOrService: string;
    vertical: 'Local Service' | 'E-commerce' | 'SaaS' | 'Healthcare' | 'Other';
    geoTargeting: {
        center: string; // "San Francisco, CA" or zip
        radius: number; // in miles
        unit: 'miles' | 'km';
    };
    painPoints: string[];
    landingPageUrl?: string;
    budget?: number; // Added budget input
    objective?: string; // Added objective input
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
    type: 'Core' | 'Lookalike' | 'Custom' | 'Retargeting';
    name: string;
    funnelStage: 'TOF' | 'MOF' | 'BOF';
    geo?: MetaGeoTargeting;
    interests?: MetaInterestCluster[];
    lookalike?: {
        source: string;
        percentage: number;
    };
    retargeting?: {
        source: 'Website' | 'Instagram' | 'Facebook' | 'Video';
        windowDays: number;
        engagementType?: 'PageView' | 'AddToCart' | 'Purchase' | 'Engaged Shopper';
    };
    priorityScore?: number;
    audienceSizeEstimate?: number;
    predictedValue?: number;
}

export interface MetaCreative {
    primaryText: string[];
    headlines: string[];
    descriptions?: string[];
    callToAction: string;
    placementAssetCustomization?: Record<string, string>;
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
    audience: MetaAudience;
    creatives: MetaCreative[];
    learningPhaseInfo?: {
        minDailyBudget: number;
        estimatedWeeklyEvents: number;
    };
}

export interface MetaBlueprintOutput {
    campaignName: string;
    objective: string;
    totalBudget: number;
    structure: {
        prospecting: {
            audiences: MetaAudience[];
            adSets: MetaAdSet[];
        };
        retargeting: {
            audiences: MetaAudience[];
            adSets: MetaAdSet[];
        };
    };
    recommendations: {
        budgetStrategy: string;
        dailySpend: number;
        learningPhaseEstimate: string;
    };
}
