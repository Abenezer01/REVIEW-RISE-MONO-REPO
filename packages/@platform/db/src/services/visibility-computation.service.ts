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
   * Compute Map Pack Visibility Percentage
   * 
   * Calculates what percentage of tracked keywords trigger a Google Map Pack (Local Pack)
   * result where the business appears. The Map Pack is the box with a map and 3 business
   * listings that appears for local searches.
   * 
   * Formula: (Keywords with Map Pack appearance / Total tracked keywords) × 100
   * 
   * @param businessId - The business to analyze
   * @param locationId - Specific location filter (null = all locations)
   * @param startDate - Start of analysis period
   * @param endDate - End of analysis period
   * @returns Object containing map pack appearances count, total keywords, and visibility percentage
   * 
   * @example
   * // Business appears in Map Pack for 45 out of 100 tracked keywords
   * const result = await computeMapPackVisibility('biz-123', null, startDate, endDate);
   * // Returns: { mapPackAppearances: 45, totalTrackedKeywords: 100, mapPackVisibility: 45.0 }
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
   * Compute Organic Presence in Top Positions
   * 
   * Counts how many keywords rank in premium organic positions:
   * - Top 3: Positions 1-3 (captures ~60% of all clicks)
   * - Top 10: Positions 1-10 (first page, captures ~90% of clicks)
   * - Top 20: Positions 1-20 (first two pages)
   * 
   * This provides a quick snapshot of overall ranking performance and helps
   * identify opportunities to move keywords from page 2 to page 1, or from
   * lower page 1 positions to top 3.
   * 
   * @param businessId - The business to analyze
   * @param locationId - Specific location filter (null = all locations)
   * @param startDate - Start of analysis period
   * @param endDate - End of analysis period
   * @returns Object with counts for top 3, top 10, and top 20 positions
   * 
   * @example
   * const result = await computeOrganicPresence('biz-123', null, startDate, endDate);
   * // Returns: { top3Count: 12, top10Count: 34, top20Count: 56 }
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
   * Compute Share of Voice (SoV) - CTR-Weighted Visibility Metric
   * 
   * Calculates the percentage of total search visibility you own in your market.
   * Unlike simple rank tracking, SoV accounts for:
   * 1. Search Volume: High-volume keywords contribute more to your score
   * 2. Click-Through Rate: Better positions get exponentially more clicks
   * 3. Market Opportunity: Your visibility relative to total potential
   * 
   * Formula: Σ(Search Volume × CTR for Position) / Σ(Search Volume) × 100
   * 
   * Where CTR is based on industry-standard click-through rates:
   * - Position 1: 31.4% CTR
   * - Position 2: 15.6% CTR
   * - Position 3: 10.0% CTR
   * - Positions 4-10: Decreasing CTR
   * - Beyond 10: Exponential decay
   * 
   * @param businessId - The business to analyze
   * @param locationId - Specific location filter (null = all locations)
   * @param startDate - Start of analysis period
   * @param endDate - End of analysis period
   * @returns Object with overall SoV percentage and per-keyword breakdown
   * 
   * @example
   * // Business with 23.4% Share of Voice
   * const result = await computeShareOfVoice('biz-123', null, startDate, endDate);
   * // Returns: {
   * //   shareOfVoice: 23.4,
   * //   breakdown: [
   * //     { keyword: 'emergency plumber', searchVolume: 5000, position: 2, contribution: 780 },
   * //     { keyword: '24hr plumber', searchVolume: 2000, position: 1, contribution: 628 },
   * //     ...
   * //   ]
   * // }
   * 
   * @remarks
   * This is the most important visibility metric as it correlates directly with
   * actual traffic and revenue. A 10% increase in SoV typically means 10% more
   * organic traffic.
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
   * Track SERP Feature Presence
   * 
   * Counts how many keywords trigger special Google search features where your
   * business appears. SERP features get premium placement and higher visibility:
   * 
   * - Featured Snippets: "Position 0" answer boxes at the top
   * - Local Pack: Map with 3 business listings
   * - People Also Ask: Expandable question boxes
   * - Knowledge Panel: Information box on the right side
   * - Image Pack: Grid of images
   * - Video Carousel: Row of video results
   * 
   * These features often appear above traditional organic results and can
   * significantly increase click-through rates.
   * 
   * @param businessId - The business to analyze
   * @param locationId - Specific location filter (null = all locations)
   * @param startDate - Start of analysis period
   * @param endDate - End of analysis period
   * @returns Object with counts for each SERP feature type
   * 
   * @example
   * const result = await trackSerpFeatures('biz-123', null, startDate, endDate);
   * // Returns: { featuredSnippetCount: 5, localPackCount: 23 }
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
   * Compute All Visibility Metrics and Store in Database
   * 
   * Orchestrates the complete visibility computation pipeline:
   * 1. Computes Map Pack Visibility
   * 2. Computes Organic Presence (Top 3/10/20)
   * 3. Computes Share of Voice (CTR-weighted)
   * 4. Tracks SERP Features
   * 5. Stores all results in VisibilityMetric table
   * 
   * This method is called by scheduled background jobs (daily, weekly, monthly)
   * to keep visibility metrics up-to-date. It uses parallel execution for
   * performance and handles errors gracefully.
   * 
   * @param businessId - The business to analyze
   * @param locationId - Specific location filter (null = business-wide metrics)
   * @param periodType - Granularity: 'daily', 'weekly', or 'monthly'
   * @param periodStart - Start of the period
   * @param periodEnd - End of the period
   * @throws Error if computation or database storage fails
   * 
   * @example
   * // Compute daily metrics for December 28, 2025
   * await computeAllMetrics(
   *   'biz-123',
   *   null,
   *   'daily',
   *   new Date('2025-12-28'),
   *   new Date('2025-12-28')
   * );
   * 
   * @remarks
   * The method uses upsert logic, so running it multiple times for the same
   * period will update existing records rather than creating duplicates.
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
   * Compute Metrics for All Active Businesses
   * 
   * Batch processes visibility metrics for all businesses in the system.
   * This is typically called by a scheduled job to compute metrics for
   * all customers at once (e.g., nightly batch job).
   * 
   * The implementation should:
   * 1. Query all businesses with active keyword tracking
   * 2. For each business, call computeAllMetrics()
   * 3. Handle errors gracefully (log and continue with other businesses)
   * 4. Provide progress reporting for monitoring
   * 
   * @param periodType - Granularity: 'daily', 'weekly', or 'monthly'
   * @param periodStart - Start of the period
   * @param periodEnd - End of the period
   * 
   * @example
   * // Compute daily metrics for all businesses for yesterday
   * const yesterday = new Date();
   * yesterday.setDate(yesterday.getDate() - 1);
   * await computeMetricsForAllBusinesses('daily', yesterday, yesterday);
   * 
   * @remarks
   * This is a placeholder implementation. In production, it should:
   * - Use pagination to avoid memory issues with large datasets
   * - Implement retry logic for failed computations
   * - Send alerts if computation fails for critical customers
   * - Track execution time and performance metrics
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
