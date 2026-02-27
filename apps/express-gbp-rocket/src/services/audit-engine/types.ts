import { NormalizedGbpProfile } from '../gbp-types';

export interface AuditIssue {
    code: string;
    severity: 'critical' | 'warning' | 'opportunity';
    title: string;
    whyItMatters: string;
    recommendation: string;
    impactWeight: number;
    // Optional extended fields
    suggestedCategories?: string[];
    recommendedPlacement?: string[];
    nextAction?: string;
}

export interface AuditBreakdown {
    completeness: number;
    description: number;
    media: number;
    freshness: number;
    categories: number;
    photoQuality: number;
    keywordOptimization: number;
}

export interface GroupedIssues {
    critical: AuditIssue[];
    warning: AuditIssue[];
    opportunity: AuditIssue[];
}

export interface KeywordGapSummary {
    missingCount: number;
    topPriorityKeywords: string[];
    extractedKeywords: string[];
}

export interface CategoryIntelligence {
    primaryCategory: string;
    isGeneric: boolean;
    suggestedAlternatives: string[];
}

export interface PhotoQualityDetails {
    totalPhotos: number;
    hasCoverPhoto: boolean;
    hasLogo: boolean;
    recency: {
        last30Days: number;
        last30To90Days: number;
        older: number;
    };
}

export interface AuditResult {
    snapshotId: string;
    totalScore: number;
    breakdown: AuditBreakdown;
    groupedIssues: GroupedIssues;
    issues: AuditIssue[];
    keywordGapSummary?: KeywordGapSummary;
    categoryIntelligence?: CategoryIntelligence;
    photoQualityDetails?: PhotoQualityDetails;
    photoImprovementPlan?: string[];
    createdAt: Date;
}

export interface EvaluatorResult {
    score: number;
    issues: AuditIssue[];
    [key: string]: any;
}

// Re-export NormalizedGbpProfile for convenience in evaluators
export { NormalizedGbpProfile };
