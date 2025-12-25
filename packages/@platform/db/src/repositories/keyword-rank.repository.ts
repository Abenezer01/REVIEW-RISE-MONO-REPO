import { BaseRepository } from './base.repository';
import { Prisma, KeywordRank } from '@prisma/client';
import { prisma } from '../client';

export class KeywordRankRepository extends BaseRepository<
  KeywordRank,
  typeof prisma.keywordRank,
  Prisma.KeywordRankWhereInput,
  Prisma.KeywordRankOrderByWithRelationInput,
  Prisma.KeywordRankCreateInput,
  Prisma.KeywordRankUpdateInput
> {
  constructor() {
    super(prisma.keywordRank, 'KeywordRank');
  }

  /**
   * Create a batch of rank records
   */
  async createBatch(
    data: Prisma.KeywordRankCreateManyInput[]
  ): Promise<Prisma.BatchPayload> {
    return this.delegate.createMany({
      data,
      skipDuplicates: false,
    });
  }

  /**
   * Get rank history for a keyword
   */
  async findByKeyword(
    keywordId: string,
    filters?: {
      startDate?: Date;
      endDate?: Date;
      device?: string;
      limit?: number;
      offset?: number;
    }
  ): Promise<KeywordRank[]> {
    const where: Prisma.KeywordRankWhereInput = {
      keywordId,
      ...(filters?.startDate || filters?.endDate
        ? {
            capturedAt: {
              ...(filters.startDate && { gte: filters.startDate }),
              ...(filters.endDate && { lte: filters.endDate }),
            },
          }
        : {}),
      ...(filters?.device && { device: filters.device }),
    };

    return this.delegate.findMany({
      where,
      orderBy: { capturedAt: 'desc' },
      take: filters?.limit,
      skip: filters?.offset,
    });
  }

  /**
   * Get the latest rank for each keyword
   */
  async findLatestRanks(keywordIds: string[]): Promise<KeywordRank[]> {
    // Use raw SQL for better performance with window functions
    const ranks = await prisma.$queryRaw<KeywordRank[]>`
      SELECT DISTINCT ON ("keywordId") *
      FROM "KeywordRank"
      WHERE "keywordId" = ANY(${keywordIds}::uuid[])
      ORDER BY "keywordId", "capturedAt" DESC
    `;

    return ranks;
  }

  /**
   * Get ranks between two dates
   */
  async findRanksBetween(
    keywordId: string,
    startDate: Date,
    endDate: Date
  ): Promise<KeywordRank[]> {
    return this.delegate.findMany({
      where: {
        keywordId,
        capturedAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { capturedAt: 'asc' },
    });
  }

  /**
   * Calculate average rank position for a keyword over a period
   */
  async getAveragePosition(
    keywordId: string,
    startDate: Date,
    endDate: Date
  ): Promise<number | null> {
    const result = await this.delegate.aggregate({
      where: {
        keywordId,
        capturedAt: {
          gte: startDate,
          lte: endDate,
        },
        rankPosition: {
          not: null,
        },
      },
      _avg: {
        rankPosition: true,
      },
    });

    return result._avg.rankPosition;
  }

  /**
   * Get all ranks for multiple keywords in a date range
   */
  async findRanksForKeywords(
    keywordIds: string[],
    startDate: Date,
    endDate: Date
  ): Promise<KeywordRank[]> {
    return this.delegate.findMany({
      where: {
        keywordId: {
          in: keywordIds,
        },
        capturedAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: [{ keywordId: 'asc' }, { capturedAt: 'desc' }],
    });
  }

  /**
   * Count ranks with Map Pack presence
   */
  async countMapPackPresence(
    keywordIds: string[],
    startDate: Date,
    endDate: Date
  ): Promise<number> {
    return this.delegate.count({
      where: {
        keywordId: {
          in: keywordIds,
        },
        capturedAt: {
          gte: startDate,
          lte: endDate,
        },
        mapPackPosition: {
          not: null,
        },
      },
    });
  }

  /**
   * Count ranks by position range
   */
  async countByPositionRange(
    keywordIds: string[],
    startDate: Date,
    endDate: Date,
    minPosition: number,
    maxPosition: number
  ): Promise<number> {
    return this.delegate.count({
      where: {
        keywordId: {
          in: keywordIds,
        },
        capturedAt: {
          gte: startDate,
          lte: endDate,
        },
        rankPosition: {
          gte: minPosition,
          lte: maxPosition,
        },
      },
    });
  }

  /**
   * Get SERP feature statistics
   */
  async getSerpFeatureStats(
    keywordIds: string[],
    startDate: Date,
    endDate: Date
  ): Promise<{
    featuredSnippet: number;
    peopleAlsoAsk: number;
    localPack: number;
    knowledgePanel: number;
    imagePack: number;
    videoCarousel: number;
  }> {
    // Count true values for each SERP feature
    const ranks = await this.delegate.findMany({
      where: {
        keywordId: {
          in: keywordIds,
        },
        capturedAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        hasFeaturedSnippet: true,
        hasPeopleAlsoAsk: true,
        hasLocalPack: true,
        hasKnowledgePanel: true,
        hasImagePack: true,
        hasVideoCarousel: true,
      },
    });

    return {
      featuredSnippet: ranks.filter(r => r.hasFeaturedSnippet).length,
      peopleAlsoAsk: ranks.filter(r => r.hasPeopleAlsoAsk).length,
      localPack: ranks.filter(r => r.hasLocalPack).length,
      knowledgePanel: ranks.filter(r => r.hasKnowledgePanel).length,
      imagePack: ranks.filter(r => r.hasImagePack).length,
      videoCarousel: ranks.filter(r => r.hasVideoCarousel).length,
    };
  }
}

// Export singleton instance
export const keywordRankRepository = new KeywordRankRepository();
