/**
 * Keyword DTOs for SERP Visibility Tracking
 */

export interface KeywordDTO {
  id: string;
  businessId: string;
  locationId?: string;
  keyword: string;
  searchVolume?: number;
  difficulty?: number;
  tags: string[];
  status: string;
  createdAt: string;
  updatedAt: string;
  language?: string;
  city?: string;
  country?: string;
  deviceType?: 'desktop' | 'mobile';
  // Include latest rank data if available
  currentRank?: number;
  mapPackPosition?: number;
  lastChecked?: string;
  dailyChange?: number;
  weeklyChange?: number;
  significantChange?: boolean;
}

export interface CreateKeywordDTO {
  businessId: string;
  locationId?: string;
  keyword: string;
  searchVolume?: number;
  difficulty?: number;
  tags?: string[];
  language?: string;
  city?: string;
  country?: string;
  deviceType?: 'desktop' | 'mobile';
}

export interface UpdateKeywordDTO {
  keyword?: string;
  searchVolume?: number;
  difficulty?: number;
  tags?: string[];
  status?: string;
  language?: string;
  city?: string;
  country?: string;
  deviceType?: 'desktop' | 'mobile';
}

export interface KeywordRankDTO {
  id: string;
  keywordId: string;
  rankPosition?: number;
  mapPackPosition?: number;
  hasFeaturedSnippet: boolean;
  hasPeopleAlsoAsk: boolean;
  hasLocalPack: boolean;
  hasKnowledgePanel: boolean;
  hasImagePack: boolean;
  hasVideoCarousel: boolean;
  rankingUrl?: string;
  searchLocation?: string;
  device: string;
  capturedAt: string;
}

export interface CreateKeywordRankDTO {
  keywordId: string;
  rankPosition?: number;
  mapPackPosition?: number;
  hasFeaturedSnippet?: boolean;
  hasPeopleAlsoAsk?: boolean;
  hasLocalPack?: boolean;
  hasKnowledgePanel?: boolean;
  hasImagePack?: boolean;
  hasVideoCarousel?: boolean;
  rankingUrl?: string;
  searchLocation?: string;
  device?: string;
  capturedAt?: string;
}

export interface BulkIngestRanksDTO {
  keywords: CreateKeywordRankDTO[];
}

export interface SuggestKeywordsDTO {
  businessId: string;
  locationId?: string;
  category?: string;
  seedTerms?: string[];
  limit?: number;
}

export interface SuggestKeywordsResponseDTO {
  suggestions: Array<{
    keyword: string;
    tags: string[];
  }>;
}

export interface HarvestCompetitorDTO {
  businessId: string;
  competitorDomain?: string;
  competitorGbpId?: string;
  limit?: number;
}

export interface HarvestCompetitorResponseDTO {
  keywords: Array<{
    keyword: string;
    tags: string[];
  }>;
}
