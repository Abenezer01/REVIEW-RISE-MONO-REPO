import { keywordRepository } from '../repositories/keyword.repository';
import { keywordRankRepository } from '../repositories/keyword-rank.repository';
import { visibilityMetricRepository } from '../repositories/visibility-metric.repository';

/**
 * Position to CTR (Click-Through Rate) conversion
 * Based on industry averages for organic search results
 */
const POSITION_CTR_MAP: Record<number, number> = {
  1: 0.314,  // 31.4%
  2: 0.156,  // 15.6%
  3: 0.100,  // 10.0%
  4: 0.073,  // 7.3%
  5: 0.059,  // 5.9%
  6: 0.049,  // 4.9%
  7: 0.042,  // 4.2%
  8: 0.037,  // 3.7%
  9: 0.032,  // 3.2%
  10: 0.029, // 2.9%
};

/**
 * Get CTR for a given position
 * Positions beyond 10 use exponential decay
 */
function getCTRForPosition(position: number): number {
  if (position <= 10 && POSITION_CTR_MAP[position]) {
    return POSITION_CTR_MAP[position];
  }
  // Exponential decay for positions beyond 10
  return 0.029 * Math.exp(-0.1 * (position - 10));
}

export class VisibilityComputationService {
  /**
   * Compute Map Pack visibility percentage
   */
  async computeMapPackVisibility(
    businessId: string,
    locationId: string | null,
    startDate: Date,
    endDate: Date
  ): Promise<{
    mapPackAppearances: number;
    totalTrackedKeywords: number;
    mapPackVisibility: number;
  }> {
    // Get all active keywords for this business/location
    const keywords = await keywordRepository.getActiveKeywords(businessId);
    const filteredKeywords = locationId
      ? keywords.filter(k => k.locationId === locationId)
      : keywords;

    const totalTrackedKeywords = filteredKeywords.length;

    if (totalTrackedKeywords === 0) {
      return {
        mapPackAppearances: 0,
        totalTrackedKeywords: 0,
        mapPackVisibility: 0,
      };
    }

    const keywordIds = filteredKeywords.map(k => k.id);

    // Count how many keywords appeared in Map Pack during this period
    const mapPackAppearances = await keywordRankRepository.countMapPackPresence(
      keywordIds,
      startDate,
      endDate
    );

    const mapPackVisibility = (mapPackAppearances / totalTrackedKeywords) * 100;

    return {
      mapPackAppearances,
      totalTrackedKeywords,
      mapPackVisibility,
    };
  }

  /**
   * Compute organic presence in top 3, 10, and 20
   */
  async computeOrganicPresence(
    businessId: string,
    locationId: string | null,
    startDate: Date,
    endDate: Date
  ): Promise<{
    top3Count: number;
    top10Count: number;
    top20Count: number;
  }> {
    const keywords = await keywordRepository.getActiveKeywords(businessId);
    const filteredKeywords = locationId
      ? keywords.filter(k => k.locationId === locationId)
      : keywords;

    if (filteredKeywords.length === 0) {
      return { top3Count: 0, top10Count: 0, top20Count: 0 };
    }

    const keywordIds = filteredKeywords.map(k => k.id);

    // Get counts for each position range
    const [top3Count, top10Count, top20Count] = await Promise.all([
      keywordRankRepository.countByPositionRange(keywordIds, startDate, endDate, 1, 3),
      keywordRankRepository.countByPositionRange(keywordIds, startDate, endDate, 1, 10),
      keywordRankRepository.countByPositionRange(keywordIds, startDate, endDate, 1, 20),
    ]);

    return { top3Count, top10Count, top20Count };
  }

  /**
   * Compute Share of Voice (weighted by search volume)
   */
  async computeShareOfVoice(
    businessId: string,
    locationId: string | null,
    startDate: Date,
    endDate: Date
  ): Promise<{
    shareOfVoice: number;
    breakdown: Array<{
      keywordId: string;
      keyword: string;
      searchVolume: number;
      position: number | null;
      contribution: number;
    }>;
  }> {
    // Get keywords with search volume
    const keywords = await keywordRepository.findByBusiness(businessId, {
      locationId: locationId || undefined,
      status: 'active',
    });

    const keywordsWithVolume = keywords.filter(k => k.searchVolume && k.searchVolume > 0);

    if (keywordsWithVolume.length === 0) {
      return { shareOfVoice: 0, breakdown: [] };
    }

    const keywordIds = keywordsWithVolume.map(k => k.id);

    // Get latest ranks for these keywords
    const latestRanks = await keywordRankRepository.findLatestRanks(keywordIds);

    // Create a map for quick lookup
    const rankMap = new Map(latestRanks.map(r => [r.keywordId, r.rankPosition]));

    let totalWeightedCTR = 0;
    let totalSearchVolume = 0;
    const breakdown: Array<{
      keywordId: string;
      keyword: string;
      searchVolume: number;
      position: number | null;
      contribution: number;
    }> = [];

    for (const keyword of keywordsWithVolume) {
      const position = rankMap.get(keyword.id) || null;
      const searchVolume = keyword.searchVolume || 0;
      const ctr = position ? getCTRForPosition(position) : 0;
      const weightedCTR = searchVolume * ctr;

      totalWeightedCTR += weightedCTR;
      totalSearchVolume += searchVolume;

      breakdown.push({
        keywordId: keyword.id,
        keyword: keyword.keyword,
        searchVolume,
        position,
        contribution: weightedCTR,
      });
    }

    // Share of Voice is the percentage of potential traffic we're capturing
    const shareOfVoice = totalSearchVolume > 0 
      ? (totalWeightedCTR / totalSearchVolume) * 100 
      : 0;

    // Sort breakdown by contribution (highest first)
    breakdown.sort((a, b) => b.contribution - a.contribution);

    return { shareOfVoice, breakdown };
  }

  /**
   * Track SERP feature presence
   */
  async trackSerpFeatures(
    businessId: string,
    locationId: string | null,
    startDate: Date,
    endDate: Date
  ): Promise<{
    featuredSnippetCount: number;
    localPackCount: number;
  }> {
    const keywords = await keywordRepository.getActiveKeywords(businessId);
    const filteredKeywords = locationId
      ? keywords.filter(k => k.locationId === locationId)
      : keywords;

    if (filteredKeywords.length === 0) {
      return { featuredSnippetCount: 0, localPackCount: 0 };
    }

    const keywordIds = filteredKeywords.map(k => k.id);

    const stats = await keywordRankRepository.getSerpFeatureStats(
      keywordIds,
      startDate,
      endDate
    );

    return {
      featuredSnippetCount: stats.featuredSnippet,
      localPackCount: stats.localPack,
    };
  }

  /**
   * Compute all metrics and store in database
   */
  async computeAllMetrics(
    businessId: string,
    locationId: string | null,
    periodType: 'daily' | 'weekly' | 'monthly',
    periodStart: Date,
    periodEnd: Date
  ): Promise<void> {
    try {
      // Compute all metrics in parallel
      const [mapPackData, organicData, sovData, serpData] = await Promise.all([
        this.computeMapPackVisibility(businessId, locationId, periodStart, periodEnd),
        this.computeOrganicPresence(businessId, locationId, periodStart, periodEnd),
        this.computeShareOfVoice(businessId, locationId, periodStart, periodEnd),
        this.trackSerpFeatures(businessId, locationId, periodStart, periodEnd),
      ]);

      // Upsert the computed metric
      await visibilityMetricRepository.upsertMetric(
        businessId,
        locationId,
        periodStart,
        periodEnd,
        periodType,
        {
          mapPackAppearances: mapPackData.mapPackAppearances,
          totalTrackedKeywords: mapPackData.totalTrackedKeywords,
          mapPackVisibility: mapPackData.mapPackVisibility,
          top3Count: organicData.top3Count,
          top10Count: organicData.top10Count,
          top20Count: organicData.top20Count,
          shareOfVoice: sovData.shareOfVoice,
          featuredSnippetCount: serpData.featuredSnippetCount,
          localPackCount: serpData.localPackCount,
        }
      );

      console.log(
        `✓ Computed visibility metrics for business ${businessId}, period ${periodType} (${periodStart.toISOString()} - ${periodEnd.toISOString()})`
      );
    } catch (error) {
      console.error(
        `✗ Failed to compute metrics for business ${businessId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Compute metrics for all active businesses
   */
  async computeMetricsForAllBusinesses(
    periodType: 'daily' | 'weekly' | 'monthly',
    periodStart: Date,
    periodEnd: Date
  ): Promise<void> {
    // This would typically get all active businesses from the database
    // For now, this is a placeholder that shows the pattern
    console.log(
      `Computing ${periodType} metrics for all businesses (${periodStart.toISOString()} - ${periodEnd.toISOString()})`
    );

    // In a real implementation:
    // 1. Get all active businesses with tracked keywords
    // 2. For each business, compute metrics
    // 3. Handle errors gracefully and continue with other businesses
  }
}

// Export singleton instance
export const visibilityComputationService = new VisibilityComputationService();
