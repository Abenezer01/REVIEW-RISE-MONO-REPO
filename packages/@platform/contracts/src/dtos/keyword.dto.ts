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
}

export interface UpdateKeywordDTO {
  keyword?: string;
  searchVolume?: number;
  difficulty?: number;
  tags?: string[];
  status?: string;
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
