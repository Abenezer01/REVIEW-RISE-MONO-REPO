import { Prisma, CompetitorReview } from '@prisma/client';
import { prisma } from '../client';
import { BaseRepository } from './base.repository';

export class CompetitorReviewRepository extends BaseRepository<
    CompetitorReview,
    typeof prisma.competitorReview,
    Prisma.CompetitorReviewWhereInput,
    Prisma.CompetitorReviewOrderByWithRelationInput,
    Prisma.CompetitorReviewCreateInput,
    Prisma.CompetitorReviewUpdateInput
> {
    constructor() {
        super(prisma.competitorReview, 'CompetitorReview');
    }

    /**
     * Get latest competitor comparison data for a business/location
     */
    async getLatestComparison(businessId: string, locationId?: string) {
        const where: Prisma.CompetitorReviewWhereInput = {
            businessId,
            ...(locationId && { locationId })
        };

        return this.delegate.findMany({
            where,
            orderBy: { capturedAt: 'desc' },
            distinct: ['competitorName'],
            take: 10
        });
    }

    /**
     * Upsert competitor review data
     */
    async upsertCompetitorData(data: {
        businessId: string;
        locationId?: string;
        competitorName: string;
        averageRating: number;
        totalReviews: number;
        source: string;
    }) {
        return this.delegate.create({
            data: {
                business: { connect: { id: data.businessId } },
                ...(data.locationId && { location: { connect: { id: data.locationId } } }),
                competitorName: data.competitorName,
                averageRating: data.averageRating,
                totalReviews: data.totalReviews,
                source: data.source
            }
        });
    }

    /**
     * Get competitor trend over time
     */
    async getCompetitorTrend(params: {
        businessId: string;
        locationId?: string;
        competitorName: string;
        periodDays: number;
    }) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - params.periodDays);

        return this.delegate.findMany({
            where: {
                businessId: params.businessId,
                ...(params.locationId && { locationId: params.locationId }),
                competitorName: params.competitorName,
                capturedAt: { gte: startDate }
            },
            orderBy: { capturedAt: 'asc' }
        });
    }
}

export const competitorReviewRepository = new CompetitorReviewRepository();
