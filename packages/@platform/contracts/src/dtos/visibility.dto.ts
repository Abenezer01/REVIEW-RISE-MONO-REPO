/**
 * Visibility Metric DTOs for SERP Analytics
 */

export interface VisibilityMetricDTO {
  id: string;
  businessId: string;
  locationId?: string;
  periodStart: string;
  periodEnd: string;
  periodType: 'daily' | 'weekly' | 'monthly';
  
  // Map Pack metrics
  mapPackAppearances: number;
  totalTrackedKeywords: number;
  mapPackVisibility: number; // Percentage (0-100)
  
  // Organic ranking metrics
  top3Count: number;
  top10Count: number;
  top20Count: number;
  
  // Share of Voice
  shareOfVoice: number; // Percentage (0-100)
  
  // SERP features
  featuredSnippetCount: number;
  localPackCount: number;
  
  computedAt: string;
  createdAt: string;
}

export interface ShareOfVoiceDTO {
  businessId: string;
  locationId?: string;
  shareOfVoice: number;
  breakdown: Array<{
    keywordId: string;
    keyword: string;
    searchVolume: number;
    position: number | null;
    contribution: number;
  }>;
  periodStart: string;
  periodEnd: string;
}

export interface SerpFeaturesDTO {
  businessId: string;
  locationId?: string;
  periodStart: string;
  periodEnd: string;
  features: {
    featuredSnippet: number;
    peopleAlsoAsk: number;
    localPack: number;
    knowledgePanel: number;
    imagePack: number;
    videoCarousel: number;
  };
}

export interface HeatmapDataDTO {
  keywords: string[]; // Keyword names
  periods: string[];  // Time periods or locations
  data: number[][];   // 2D array: [keywordIndex][periodIndex] = metric value
  metric: 'rank' | 'visibility' | 'sov';
  businessId: string;
  locationId?: string;
}

export interface VisibilityMetricsQueryDTO {
  businessId: string;
  locationId?: string;
  periodType?: 'daily' | 'weekly' | 'monthly';
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

export interface HeatmapQueryDTO {
  businessId: string;
  locationId?: string;
  keywordIds?: string[];
  tags?: string[];
  startDate: string;
  endDate: string;
  metric: 'rank' | 'mapPack' | 'sov';
  groupBy: 'time' | 'location';
}
