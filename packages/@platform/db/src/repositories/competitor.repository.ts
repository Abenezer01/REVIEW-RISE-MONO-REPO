import { prisma } from '../client';
import { BaseRepository } from './base.repository';
import type { Competitor, Prisma } from '@prisma/client';

export class CompetitorRepository extends BaseRepository<Competitor> {
    constructor() {
        super(prisma.competitor);
    }

    /**
     * Upsert a competitor by domain for a business
     */
    async upsertByDomain(
        businessId: string,
        domain: string,
        data?: Partial<Omit<Competitor, 'id' | 'businessId' | 'domain' | 'createdAt' | 'updatedAt'>>
    ): Promise<Competitor> {
        return prisma.competitor.upsert({
            where: {
                businessId_domain: {
                    businessId,
                    domain,
                },
            },
            create: {
                businessId,
                domain,
                ...data,
            },
            update: {
                ...data,
                updatedAt: new Date(),
            },
        });
    }

    /**
     * Get all competitors for a business
     */
    async findByBusinessId(businessId: string): Promise<Competitor[]> {
        return prisma.competitor.findMany({
            where: { businessId },
            orderBy: [
                { visibilityScore: 'desc' },
                { avgRank: 'asc' },
            ],
        });
    }

    /**
     * Get competitors for a business that rank for a specific keyword
     */
    async findByBusinessIdAndKeyword(businessId: string, keywordId: string): Promise<Competitor[]> {
        return prisma.competitor.findMany({
            where: {
                businessId,
                ranks: {
                    some: {
                        keywordId,
                    },
                },
            },
            orderBy: [
                { visibilityScore: 'desc' },
                { avgRank: 'asc' },
            ],
        });
    }

    /**
     * Get competitor with rank history
     */
    async findByIdWithRanks(
        id: string,
        options?: {
            keywordId?: string;
            limit?: number;
        }
    ) {
        return prisma.competitor.findUnique({
            where: { id },
            include: {
                ranks: {
                    where: options?.keywordId ? { keywordId: options.keywordId } : undefined,
                    orderBy: { capturedAt: 'desc' },
                    take: options?.limit || 100,
                    include: {
                        keyword: true,
                    },
                },
            },
        });
    }

    /**
     * Update competitor metrics (avg rank, visibility, etc.)
     */
    async updateMetrics(
        id: string,
        metrics: {
            avgRank?: number;
            visibilityScore?: number;
            reviewCount?: number;
            rating?: number;
            gbpCompleteness?: number;
        }
    ): Promise<Competitor> {
        return prisma.competitor.update({
            where: { id },
            data: metrics,
        });
    }

    /**
     * Delete competitors for a business
     */
    async deleteByBusinessId(businessId: string): Promise<{ count: number }> {
        return prisma.competitor.deleteMany({
            where: { businessId },
        });
    }
}

export const competitorRepository = new CompetitorRepository();
