export interface BlueprintInput {
    businessName?: string;
    offerOrService: string;
    vertical: 'Local Service' | 'E-commerce' | 'SaaS' | 'Healthcare' | 'Other';
    geoTargeting: string[];
    painPoints: string[];
    landingPageUrl?: string;
    objective?: 'Leads' | 'Sales' | 'Brand Awareness' | 'Website Traffic' | 'Local Store Visits';
    budgetTier?: 'Low' | 'Mid' | 'High';
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
    score: number;
    messageMatchScore?: number;
    ctaStrength?: 'Weak' | 'Medium' | 'Strong';
    mobileOptimized: boolean;
    trustSignalsDetected: string[];
    missingElements: string[];
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

export interface BlueprintOutput {
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
