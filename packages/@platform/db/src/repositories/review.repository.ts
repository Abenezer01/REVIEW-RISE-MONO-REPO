import { Prisma, Review } from '@prisma/client';
import { prisma } from '../client';
import { BaseRepository } from './base.repository';

export class ReviewRepository extends BaseRepository<
    Review,
    typeof prisma.review,
    Prisma.ReviewWhereInput,
    Prisma.ReviewOrderByWithRelationInput,
    Prisma.ReviewCreateInput,
    Prisma.ReviewUpdateInput
> {
    constructor() {
        super(prisma.review, 'Review');
    }

    async findByBusinessId(businessId: string) {
        return this.delegate.findMany({
            where: { businessId },
            orderBy: { publishedAt: 'desc' },
        });
    }

    async countByBusinessId(businessId: string) {
        return this.count({ businessId });
    }

    async findPaginated(params: {
        where: Prisma.ReviewWhereInput;
        skip?: number;
        take?: number;
        orderBy?: Prisma.ReviewOrderByWithRelationInput;
    }) {
        const [items, total] = await Promise.all([
            this.delegate.findMany({
                where: params.where,
                skip: params.skip,
                take: params.take,
                orderBy: params.orderBy || { publishedAt: 'desc' },
            }),
            this.count(params.where),
        ]);

        return { items, total };
    }
     async upsertReview(data: Prisma.ReviewCreateInput) {
        return this.delegate.upsert({
            where: {
                platform_externalId: {
                    platform: data.platform,
                    externalId: data.externalId
                }
            },
            update: {
                rating: data.rating,
                content: data.content,
                author: data.author,
                response: data.response,
                respondedAt: data.respondedAt,
                // publishedAt is usually immutable but if platform updates it...
            },
            create: data
        });
    }

    async findByLocationId(locationId: string) {
        return this.delegate.findMany({
            where: { locationId },
            orderBy: { publishedAt: 'desc' }
        });
    }

    /**
     * Get rating trend over time grouped by day
     */
    async getRatingTrend(params: {
        businessId: string;
        locationId?: string;
        periodDays: number;
    }) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - params.periodDays);

        const reviews = await this.delegate.findMany({
            where: {
                businessId: params.businessId,
                ...(params.locationId && { locationId: params.locationId }),
                publishedAt: { gte: startDate }
            },
            select: { rating: true, publishedAt: true },
            orderBy: { publishedAt: 'asc' }
        });

        // Group by date and calculate average rating
        const trendMap = new Map<string, { total: number; count: number }>();
        
        reviews.forEach(review => {
            const dateKey = review.publishedAt.toISOString().split('T')[0];
            const existing = trendMap.get(dateKey) || { total: 0, count: 0 };
            trendMap.set(dateKey, {
                total: existing.total + review.rating,
                count: existing.count + 1
            });
        });

        return Array.from(trendMap.entries()).map(([date, data]) => ({
            date,
            averageRating: Number((data.total / data.count).toFixed(2))
        }));
    }

    /**
     * Get review volume by source (platform) over time
     */
    async getVolumeBySource(params: {
        businessId: string;
        locationId?: string;
        periodDays: number;
    }) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - params.periodDays);

        const reviews = await this.delegate.findMany({
            where: {
                businessId: params.businessId,
                ...(params.locationId && { locationId: params.locationId }),
                publishedAt: { gte: startDate }
            },
            select: { platform: true, publishedAt: true },
            orderBy: { publishedAt: 'asc' }
        });

        // Group by date and platform
        const volumeMap = new Map<string, Map<string, number>>();

        reviews.forEach(review => {
            const dateKey = review.publishedAt.toISOString().split('T')[0];
            if (!volumeMap.has(dateKey)) {
                volumeMap.set(dateKey, new Map());
            }
            const platformMap = volumeMap.get(dateKey)!;
            platformMap.set(review.platform, (platformMap.get(review.platform) || 0) + 1);
        });

        return Array.from(volumeMap.entries()).map(([date, platforms]) => ({
            date,
            volumes: Object.fromEntries(platforms)
        }));
    }

    /**
     * Get sentiment heatmap data
     */
    async getSentimentHeatmap(params: {
        businessId: string;
        locationId?: string;
        periodDays: number;
        groupBy: 'day' | 'week';
    }) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - params.periodDays);

        const reviews = await this.delegate.findMany({
            where: {
                businessId: params.businessId,
                ...(params.locationId && { locationId: params.locationId }),
                publishedAt: { gte: startDate },
                sentiment: { not: null }
            },
            select: { sentiment: true, publishedAt: true, locationId: true, platform: true },
            orderBy: { publishedAt: 'asc' }
        });

        // Group by time period and sentiment
        const heatmapMap = new Map<string, { positive: number; neutral: number; negative: number }>();

        reviews.forEach(review => {
            let dateKey: string;
            if (params.groupBy === 'week') {
                const weekStart = new Date(review.publishedAt);
                weekStart.setDate(weekStart.getDate() - weekStart.getDay());
                dateKey = weekStart.toISOString().split('T')[0];
            } else {
                dateKey = review.publishedAt.toISOString().split('T')[0];
            }

            if (!heatmapMap.has(dateKey)) {
                heatmapMap.set(dateKey, { positive: 0, neutral: 0, negative: 0 });
            }

            const sentimentCounts = heatmapMap.get(dateKey)!;
            const sentiment = review.sentiment?.toLowerCase();
            
            if (sentiment === 'positive') sentimentCounts.positive++;
            else if (sentiment === 'negative') sentimentCounts.negative++;
            else sentimentCounts.neutral++;
        });

        return Array.from(heatmapMap.entries()).map(([date, sentiments]) => ({
            date,
            ...sentiments
        }));
    }

    /**
     * Extract top keywords from reviews
     */
    async getTopKeywords(params: {
        businessId: string;
        locationId?: string;
        limit?: number;
    }) {
        const reviews = await this.delegate.findMany({
            where: {
                businessId: params.businessId,
                ...(params.locationId && { locationId: params.locationId })
            },
            select: { tags: true },
            take: 500, // Limit to recent 500 reviews for performance
            orderBy: { publishedAt: 'desc' }
        });

        // Count keyword frequency
        const keywordCount = new Map<string, number>();
        
        reviews.forEach(review => {
            review.tags.forEach(tag => {
                keywordCount.set(tag, (keywordCount.get(tag) || 0) + 1);
            });
        });

        // Sort by frequency and return top N
        return Array.from(keywordCount.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, params.limit || 20)
            .map(([keyword, count]) => ({ keyword, count }));
    }

    /**
     * Get recent reviews summary
     */
    async getRecentSummary(params: {
        businessId: string;
        locationId?: string;
        limit: number;
    }) {
        const reviews = await this.delegate.findMany({
            where: {
                businessId: params.businessId,
                ...(params.locationId && { locationId: params.locationId })
            },
            select: {
                id: true,
                author: true,
                rating: true,
                content: true,
                sentiment: true,
                publishedAt: true,
                response: true,
                respondedAt: true
            },
            orderBy: { publishedAt: 'desc' },
            take: params.limit
        });

        // Count unreplied reviews
        const unrepliedCount = await this.delegate.count({
            where: {
                businessId: params.businessId,
                ...(params.locationId && { locationId: params.locationId }),
                response: null
            }
        });

        // Count recent replies (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const recentRepliesCount = await this.delegate.count({
            where: {
                businessId: params.businessId,
                ...(params.locationId && { locationId: params.locationId }),
                respondedAt: { gte: sevenDaysAgo }
            }
        });

        return {
            reviews,
            unrepliedCount,
            recentRepliesCount
        };
    }

    /**
     * Get dashboard metrics with comparison to previous period
     */
    async getDashboardMetrics(params: {
        businessId: string;
        locationId?: string;
        periodDays: number;
    }) {
        const now = new Date();
        const currentStartDate = new Date();
        currentStartDate.setDate(now.getDate() - params.periodDays);

        const previousEndDate = new Date(currentStartDate);
        const previousStartDate = new Date();
        previousStartDate.setDate(previousEndDate.getDate() - params.periodDays);

        const whereBase = {
            businessId: params.businessId,
            ...(params.locationId && { locationId: params.locationId })
        };

        // Helper to get stats for a date range
        const getStatsForRange = async (start: Date, end: Date) => {
            const whereRange = { ...whereBase, publishedAt: { gte: start, lt: end } };
            
            const count = await this.delegate.count({ where: whereRange });
            
            const aggregations = await this.delegate.aggregate({
                where: whereRange,
                _avg: { rating: true }
            });

            // Replies in this range (based on respondedAt)
            // Note: This logic assumes replies happened in the same period, 
            // but usually we count replies made *in that period* regardless of when review was posted.
            // Using separate query for replies based on respondedAt
            const replyWhere = {
                ...whereBase,
                respondedAt: { gte: start, lt: end },
                response: { not: null }
            };
            const replyCount = await this.delegate.count({ where: replyWhere });

            // Positive Sentiment Count
            const positiveCount = await this.delegate.count({
                where: { ...whereRange, sentiment: 'positive' }
            });

            return {
                count,
                avgRating: aggregations._avg.rating || 0,
                replyCount,
                positiveCount
            };
        };

        const [currentStats, previousStats] = await Promise.all([
            getStatsForRange(currentStartDate, now),
            getStatsForRange(previousStartDate, previousEndDate)
        ]);

        return {
            current: {
                totalReviews: currentStats.count,
                averageRating: Number(currentStats.avgRating.toFixed(1)),
                responseCount: currentStats.replyCount,
                positiveSentiment: currentStats.count > 0 
                    ? Math.round((currentStats.positiveCount / currentStats.count) * 100) 
                    : 0
            },
            previous: {
                totalReviews: previousStats.count,
                averageRating: Number(previousStats.avgRating.toFixed(1)),
                responseCount: previousStats.replyCount,
                positiveSentiment: previousStats.count > 0 
                    ? Math.round((previousStats.positiveCount / previousStats.count) * 100) 
                    : 0
            }
        };
    }
}

export const reviewRepository = new ReviewRepository();
