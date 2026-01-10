import { Prisma, BrandScore } from '@prisma/client';
import { prisma } from '../client';
import { BaseRepository } from './base.repository';

/**
 * Brand Score Repository
 * 
 * Handles all database operations related to brand health scores.
 * Provides type-safe methods for score tracking, historical analysis, and trend monitoring.
 */
export class BrandScoreRepository extends BaseRepository<
    BrandScore,
    typeof prisma.brandScore,
    Prisma.BrandScoreWhereInput,
    Prisma.BrandScoreOrderByWithRelationInput,
    Prisma.BrandScoreCreateInput,
    Prisma.BrandScoreUpdateInput
> {
    constructor() {
        super(prisma.brandScore, 'BrandScore');
    }

    /**
     * Find latest score by business ID
     */
    async findLatestByBusinessId(businessId: string): Promise<BrandScore | null> {
        return this.delegate.findFirst({
            where: { businessId },
            orderBy: { computedAt: 'desc' },
        });
    }

    /**
     * Find score by business ID and period
     */
    async findByBusinessIdAndPeriod(
        businessId: string,
        periodStart: Date,
        periodEnd: Date
    ): Promise<BrandScore | null> {
        return this.delegate.findFirst({
            where: {
                businessId,
                periodStart,
                periodEnd,
            },
        });
    }

    /**
     * Get score history for a business
     */
    async getScoreHistory(
        businessId: string,
        limit: number = 30
    ): Promise<Array<{
        visibilityScore: number;
        trustScore: number;
        consistencyScore: number;
        computedAt: Date;
        periodStart: Date;
        periodEnd: Date;
    }>> {
        return this.delegate.findMany({
            where: { businessId },
            orderBy: { computedAt: 'desc' },
            take: limit,
            select: {
                visibilityScore: true,
                trustScore: true,
                consistencyScore: true,
                computedAt: true,
                periodStart: true,
                periodEnd: true,
            },
        });
    }

    /**
     * Get score trend (comparing latest to previous period)
     */
    async getScoreTrend(businessId: string): Promise<{
        current: BrandScore | null;
        previous: BrandScore | null;
        trends: {
            visibility: number;
            trust: number;
            consistency: number;
        };
    }> {
        const scores = await this.delegate.findMany({
            where: { businessId },
            orderBy: { computedAt: 'desc' },
            take: 2,
        });

        const current = scores[0] || null;
        const previous = scores[1] || null;

        const trends = {
            visibility: current && previous
                ? current.visibilityScore - previous.visibilityScore
                : 0,
            trust: current && previous
                ? current.trustScore - previous.trustScore
                : 0,
            consistency: current && previous
                ? current.consistencyScore - previous.consistencyScore
                : 0,
        };

        return { current, previous, trends };
    }

    /**
     * Get average scores over a period
     */
    async getAverageScores(
        businessId: string,
        startDate: Date,
        endDate: Date
    ): Promise<{
        avgVisibility: number;
        avgTrust: number;
        avgConsistency: number;
        count: number;
    }> {
        const scores = await this.delegate.findMany({
            where: {
                businessId,
                computedAt: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            select: {
                visibilityScore: true,
                trustScore: true,
                consistencyScore: true,
            },
        });

        if (scores.length === 0) {
            return {
                avgVisibility: 0,
                avgTrust: 0,
                avgConsistency: 0,
                count: 0,
            };
        }

        const sum = scores.reduce(
            (acc, score) => ({
                visibility: acc.visibility + score.visibilityScore,
                trust: acc.trust + score.trustScore,
                consistency: acc.consistency + score.consistencyScore,
            }),
            { visibility: 0, trust: 0, consistency: 0 }
        );

        return {
            avgVisibility: Math.round(sum.visibility / scores.length),
            avgTrust: Math.round(sum.trust / scores.length),
            avgConsistency: Math.round(sum.consistency / scores.length),
            count: scores.length,
        };
    }

    /**
     * Get score breakdown for latest score
     */
    async getLatestBreakdown(businessId: string): Promise<{
        visibilityBreakdown: any;
        trustBreakdown: any;
        consistencyBreakdown: any;
    } | null> {
        const score = await this.findLatestByBusinessId(businessId);

        if (!score) return null;

        return {
            visibilityBreakdown: score.visibilityBreakdown,
            trustBreakdown: score.trustBreakdown,
            consistencyBreakdown: score.consistencyBreakdown,
        };
    }

    /**
     * Upsert score (create or update based on period)
     */
    async upsertScore(
        businessId: string,
        periodStart: Date,
        periodEnd: Date,
        scoreData: {
            visibilityScore: number;
            trustScore: number;
            consistencyScore: number;
            visibilityBreakdown: any;
            trustBreakdown: any;
            consistencyBreakdown: any;
        }
    ): Promise<BrandScore> {
        const existing = await this.findByBusinessIdAndPeriod(
            businessId,
            periodStart,
            periodEnd
        );

        if (existing) {
            return this.update(existing.id, {
                ...scoreData,
                computedAt: new Date(),
            });
        } else {
            return this.create({
                business: { connect: { id: businessId } },
                periodStart,
                periodEnd,
                ...scoreData,
            });
        }
    }

    /**
     * Delete old scores (cleanup)
     */
    async deleteOldScores(businessId: string, daysOld: number = 365): Promise<{ count: number }> {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysOld);

        return this.deleteMany({
            businessId,
            computedAt: {
                lt: cutoffDate,
            },
        });
    }

    /**
     * Get businesses with low scores (for alerting)
     */
    async findBusinessesWithLowScores(threshold: number = 50): Promise<BrandScore[]> {
        return this.delegate.findMany({
            where: {
                OR: [
                    { visibilityScore: { lt: threshold } },
                    { trustScore: { lt: threshold } },
                    { consistencyScore: { lt: threshold } },
                ],
            },
            orderBy: {
                computedAt: 'desc',
            },
            distinct: ['businessId'],
        });
    }
}

// Export singleton instance
export const brandScoreRepository = new BrandScoreRepository();
