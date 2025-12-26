import { prisma } from '../client';
import { BaseRepository } from './base.repository';
import type { CompetitorKeywordRank, Prisma } from '@prisma/client';

export class CompetitorRankRepository extends BaseRepository<CompetitorKeywordRank> {
    constructor() {
        super(prisma.competitorKeywordRank);
    }

    /**
     * Create multiple competitor rank records in batch
     */
    async createBatch(
        data: Prisma.CompetitorKeywordRankCreateManyInput[]
    ): Promise<{ count: number }> {
        return prisma.competitorKeywordRank.createMany({
            data,
            skipDuplicates: true,
        });
    }

    /**
     * Find ranks for a specific competitor
     */
    async findByCompetitor(
        competitorId: string,
        options?: {
            keywordId?: string;
            startDate?: Date;
            endDate?: Date;
            limit?: number;
            offset?: number;
        }
    ): Promise<CompetitorKeywordRank[]> {
        return prisma.competitorKeywordRank.findMany({
            where: {
                competitorId,
                ...(options?.keywordId && { keywordId: options.keywordId }),
                ...(options?.startDate || options?.endDate
                    ? {
                        capturedAt: {
                            ...(options.startDate && { gte: options.startDate }),
                            ...(options.endDate && { lte: options.endDate }),
                        },
                    }
                    : {}),
            },
            orderBy: { capturedAt: 'desc' },
            take: options?.limit,
            skip: options?.offset,
            include: {
                keyword: true,
            },
        });
    }

    /**
     * Find ranks for a specific keyword across all competitors
     */
    async findByKeyword(
        keywordId: string,
        options?: {
            competitorId?: string;
            startDate?: Date;
            endDate?: Date;
            limit?: number;
        }
    ): Promise<CompetitorKeywordRank[]> {
        return prisma.competitorKeywordRank.findMany({
            where: {
                keywordId,
                ...(options?.competitorId && { competitorId: options.competitorId }),
                ...(options?.startDate || options?.endDate
                    ? {
                        capturedAt: {
                            ...(options.startDate && { gte: options.startDate }),
                            ...(options.endDate && { lte: options.endDate }),
                        },
                    }
                    : {}),
            },
            orderBy: { capturedAt: 'desc' },
            take: options?.limit || 100,
            include: {
                competitor: true,
            },
        });
    }

    /**
     * Get latest rank for a competitor on a specific keyword
     */
    async getLatestRank(
        competitorId: string,
        keywordId: string
    ): Promise<CompetitorKeywordRank | null> {
        return prisma.competitorKeywordRank.findFirst({
            where: {
                competitorId,
                keywordId,
            },
            orderBy: { capturedAt: 'desc' },
        });
    }

    /**
     * Delete old rank records (for cleanup)
     */
    async deleteOlderThan(date: Date): Promise<{ count: number }> {
        return prisma.competitorKeywordRank.deleteMany({
            where: {
                capturedAt: {
                    lt: date,
                },
            },
        });
    }
}

export const competitorRankRepository = new CompetitorRankRepository();
