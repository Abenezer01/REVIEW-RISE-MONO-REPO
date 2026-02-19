export interface BlueprintInput {
    businessName: string; // Required
    services: string[]; // Array of services (min 1)
    offer: string; // Distinct offer/promotion (min 5 chars)
    vertical: 'Local Service' | 'E-commerce' | 'SaaS' | 'Healthcare' | 'Restaurant' | 'Real Estate' | 'Legal' | 'Other';
    geo: string; // Single location string (e.g., "Austin, TX")
    painPoints?: string[]; // Optional
    landingPageUrl?: string; // Optional (websiteUrl in engine)
    objective: 'Leads' | 'Sales' | 'Awareness' | 'Local Visits'; // Required
    budget: number; // Required (positive number)
    currency?: string; // Optional, defaults to USD
    expectedAvgCpc?: number; // Optional fallback CPC
    conversionTrackingEnabled?: boolean; // Optional, defaults to true
}

export interface KeywordCluster {
    intent: 'Brand' | 'Service' | 'Commercial' | 'Competitor' | 'Problem';
    theme: string;
    funnelStage?: 'TOF' | 'MOF' | 'BOF';
    keywords: { term: string; matchType: 'Exact' | 'Phrase' | 'Broad' }[];
}

export interface RSAAssets {
    headlines: string[];
    descriptions: string[];
}

export interface AdGroup {
    name: string;
    keywords: KeywordCluster;
    assets: RSAAssets;
    budgetAllocation?: {
        percentage: number;
        amount: number;
        estimatedClicks: number;
        estimatedConversions?: number;
        estimatedCpa?: number;
        learningPhaseStatus?: string;
    };
}

export interface Campaign {
    name: string;
    objective: string;
    budgetRecommendation: string;
    adGroups: AdGroup[];
}

export interface NegativeKeywordList {
    category: string;
    keywords: string[];
}

export interface Extensions {
    sitelinks: { text: string; url?: string; description?: string }[];
    callouts: string[];
}

export interface LandingPageAnalysis {
    url: string;
    isValid: boolean;
    validationMessage?: string;
    score: number; // Legacy score
    messageMatchScore?: number;
    ctaStrength?: 'Weak' | 'Medium' | 'Strong';
    mobileOptimized: boolean;
    trustSignalsDetected: string[];
    missingElements: string[];

    // Google Ads Quality Score & Strategy
    qualityScorePrediction: number; // 1-10
    conversionReadinessScore: number; // 1-10
    frictionScore: number; // 1-10 (lower is better)
    recommendations: string[];
    landingPageType: 'lead_gen' | 'ecommerce' | 'homepage' | 'informational';
    adToLandingConsistencyScore: number; // 1-10
}

export interface ValidationWarning {
    type: 'RSA' | 'Keyword' | 'Negative' | 'Geo' | 'Other';
    message: string;
    context?: string;
}

export interface PerformanceAssumptions {
    expectedCTR: string; // e.g. "3-5%"
    expectedCPC: string; // e.g. "$2.50-$4.00"
    conversionDifficulty: number; // 1-10 scale
}

export interface StrategySummary {
    goal: string;
    totalBudget: number;
    vertical: string;
    bidStrategy: string;
}

export interface BudgetModeling {
    clickCapacity: number;
    budgetTier: 'Low' | 'Medium' | 'High';
    recommendedCampaignCount: number;
    avgCpc?: number; // For transparency in UI
}

export interface BlueprintOutput {
    strategySummary?: StrategySummary;
    budgetModeling?: BudgetModeling;
    campaigns?: Campaign[]; // New structure
    clusters: KeywordCluster[];
    adGroups: AdGroup[];
    negatives: NegativeKeywordList[];
    rsa_assets?: RSAAssets[]; // Summary
    extensions?: Extensions;
    landingPageAnalysis?: LandingPageAnalysis;
    validationWarnings?: ValidationWarning[];
    performanceAssumptions?: PerformanceAssumptions;
}
