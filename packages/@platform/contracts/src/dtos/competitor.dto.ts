export interface CompetitorDto {
    id: string;
    businessId: string;
    domain: string;
    name?: string;
    avgRank?: number;
    visibilityScore?: number;
    reviewCount?: number;
    rating?: number;
    gbpCompleteness?: number;
    createdAt: string;
    updatedAt: string;
}

export interface CompetitorKeywordRankDto {
    id: string;
    competitorId: string;
    keywordId: string;
    rankPosition?: number;
    rankingUrl?: string;
    capturedAt: string;
}

export interface CreateCompetitorDto {
    businessId: string;
    domain: string;
    name?: string;
}

export interface CompetitorWithRanksDto extends CompetitorDto {
    ranks: CompetitorKeywordRankDto[];
}
