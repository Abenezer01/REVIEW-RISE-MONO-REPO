export interface BlueprintInput {
    businessName?: string;
    offerOrService: string;
    vertical: 'Local Service' | 'E-commerce' | 'SaaS' | 'Healthcare' | 'Other';
    geoTargeting: string[];
    painPoints: string[];
    landingPageUrl?: string;
}

export interface KeywordCluster {
    intent: 'Brand' | 'Service' | 'Competitor' | 'Problem';
    theme: string;
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

export interface NegativeKeywordList {
    category: string;
    keywords: string[];
}

export interface LandingPageAnalysis {
    url: string;
    score: number;
    mobileOptimized: boolean;
    trustSignalsDetected: string[];
    missingElements: string[];
}

export interface BlueprintOutput {
    clusters: KeywordCluster[];
    adGroups: AdGroup[];
    negatives: NegativeKeywordList[];
    landingPageAnalysis?: LandingPageAnalysis;
}
