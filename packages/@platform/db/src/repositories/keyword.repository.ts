import { BaseRepository } from './base.repository';
import { Prisma, Keyword } from '@prisma/client';
import { prisma } from '../client';

export class KeywordRepository extends BaseRepository<
  Keyword,
  typeof prisma.keyword,
  Prisma.KeywordWhereInput,
  Prisma.KeywordOrderByWithRelationInput,
  Prisma.KeywordCreateInput,
  Prisma.KeywordUpdateInput
> {
  constructor() {
    super(prisma.keyword, 'Keyword');
  }

  /**
   * Find all keywords for a business with optional filters
   */
  async findByBusiness(
    businessId: string,
    filters?: {
      locationId?: string;
      status?: string;
      tags?: string[];
      limit?: number;
      offset?: number;
    }
  ): Promise<Keyword[]> {
    const where: Prisma.KeywordWhereInput = {
      businessId,
      ...(filters?.locationId && { locationId: filters.locationId }),
      ...(filters?.status && { status: filters.status }),
      ...(filters?.tags && filters.tags.length > 0 && {
        tags: { hasSome: filters.tags },
      }),
    };

    return this.delegate.findMany({
      where,
      take: filters?.limit,
      skip: filters?.offset,
      orderBy: { createdAt: 'desc' },
      include: {
        location: true,
        ranks: {
          take: 1,
          orderBy: { capturedAt: 'desc' },
        },
      },
    });
  }

  /**
   * Find all keywords for a location
   */
  async findByLocation(
    locationId: string,
    filters?: {
      status?: string;
      limit?: number;
      offset?: number;
    }
  ): Promise<Keyword[]> {
    const where: Prisma.KeywordWhereInput = {
      locationId,
      ...(filters?.status && { status: filters.status }),
    };

    return this.delegate.findMany({
      where,
      take: filters?.limit,
      skip: filters?.offset,
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get all active keywords for a business
   */
  async getActiveKeywords(businessId: string): Promise<Keyword[]> {
    return this.delegate.findMany({
      where: {
        businessId,
        status: 'active',
        deletedAt: null,
      },
      orderBy: { keyword: 'asc' },
    });
  }

  /**
   * Soft delete a keyword - override to set status as well
   */
  async softDelete(id: string): Promise<Keyword> {
    return this.delegate.update({
      where: { id },
      data: {
        status: 'archived',
        deletedAt: new Date(),
      },
    });
  }

  /**
   * Bulk create keywords
   */
  async createManyKeywords(
    data: Prisma.KeywordCreateManyInput[]
  ): Promise<Prisma.BatchPayload> {
    return this.delegate.createMany({
      data,
      skipDuplicates: true,
    });
  }

  /**
   * Get keyword count by business
   */
  async countByBusiness(businessId: string, status?: string): Promise<number> {
    return this.delegate.count({
      where: {
        businessId,
        ...(status && { status }),
        deletedAt: null,
      },
    });
  }

  /**
   * Search keywords by text
   */
  async searchKeywords(
    businessId: string,
    searchTerm: string,
    limit: number = 10
  ): Promise<Keyword[]> {
    return this.delegate.findMany({
      where: {
        businessId,
        keyword: {
          contains: searchTerm,
          mode: 'insensitive',
        },
        status: 'active',
        deletedAt: null,
      },
      take: limit,
      orderBy: { keyword: 'asc' },
    });
  }
}

// Export singleton instance
export const keywordRepository = new KeywordRepository();
