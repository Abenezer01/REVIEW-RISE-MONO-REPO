import { BaseRepository } from './base.repository';
import { Prisma, VisibilityMetric } from '@prisma/client';
import { prisma } from '../client';

export class VisibilityMetricRepository extends BaseRepository<
  VisibilityMetric,
  typeof prisma.visibilityMetric,
  Prisma.VisibilityMetricWhereInput,
  Prisma.VisibilityMetricOrderByWithRelationInput,
  Prisma.VisibilityMetricCreateInput,
  Prisma.VisibilityMetricUpdateInput
> {
  constructor() {
    super(prisma.visibilityMetric, 'VisibilityMetric');
  }

  /**
   * Find metrics for a business with optional filters
   */
  async findByBusiness(
    businessId: string,
    filters?: {
      locationId?: string;
      periodType?: string;
      startDate?: Date;
      endDate?: Date;
      limit?: number;
      offset?: number;
    }
  ): Promise<VisibilityMetric[]> {
    const where: Prisma.VisibilityMetricWhereInput = {
      businessId,
      ...(filters?.locationId && { locationId: filters.locationId }),
      ...(filters?.periodType && { periodType: filters.periodType }),
      ...(filters?.startDate || filters?.endDate
        ? {
          periodStart: {
            ...(filters.startDate && { gte: filters.startDate }),
            ...(filters.endDate && { lte: filters.endDate }),
          },
        }
        : {}),
    };

    return this.delegate.findMany({
      where,
      orderBy: { periodStart: 'desc' },
      take: filters?.limit,
      skip: filters?.offset,
    });
  }

  /**
   * Get metrics for a specific period
   */
  async findByPeriod(
    businessId: string,
    periodType: string,
    startDate: Date,
    endDate: Date
  ): Promise<VisibilityMetric[]> {
    return this.delegate.findMany({
      where: {
        businessId,
        periodType,
        periodStart: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { periodStart: 'asc' },
    });
  }

  /**
   * Get the latest metric for a business/location
   */
  async getLatestMetric(
    businessId: string,
    locationId?: string,
    periodType?: string
  ): Promise<VisibilityMetric | null> {
    return this.delegate.findFirst({
      where: {
        businessId,
        ...(locationId && { locationId }),
        ...(periodType && { periodType }),
      },
      orderBy: { periodStart: 'desc' },
    });
  }

  /**
   * Upsert a visibility metric
   */
  async upsertMetric(
    businessId: string,
    locationId: string | null,
    periodStart: Date,
    periodEnd: Date,
    periodType: string,
    data: Omit<Prisma.VisibilityMetricCreateInput, 'business' | 'location' | 'periodStart' | 'periodEnd' | 'periodType'>
  ): Promise<VisibilityMetric> {
    // Check if metric exists
    const existing = await this.delegate.findFirst({
      where: {
        businessId,
        locationId: locationId || null,
        periodStart,
        periodEnd,
        periodType,
      },
    });

    if (existing) {
      return this.delegate.update({
        where: { id: existing.id },
        data: {
          ...data,
          computedAt: new Date(),
        },
      });
    }

    return this.delegate.create({
      data: {
        business: {
          connect: { id: businessId },
        },
        ...(locationId && {
          location: {
            connect: { id: locationId },
          },
        }),
        periodStart,
        periodEnd,
        periodType,
        ...data,
      },
    });
  }

  /**
   * Get metrics trend over time
   */
  async getTrend(
    businessId: string,
    periodType: string,
    numberOfPeriods: number,
    locationId?: string
  ): Promise<VisibilityMetric[]> {
    return this.delegate.findMany({
      where: {
        businessId,
        periodType,
        ...(locationId && { locationId }),
      },
      orderBy: { periodStart: 'desc' },
      take: numberOfPeriods,
    });
  }

  /**
   * Get average metrics over a period
   */
  async getAverageMetrics(
    businessId: string,
    startDate: Date,
    endDate: Date,
    locationId?: string
  ): Promise<{
    avgMapPackVisibility: number | null;
    avgTop3Count: number | null;
    avgTop10Count: number | null;
    avgTop20Count: number | null;
    avgShareOfVoice: number | null;
  }> {
    const result = await this.delegate.aggregate({
      where: {
        businessId,
        ...(locationId && { locationId }),
        periodStart: {
          gte: startDate,
          lte: endDate,
        },
      },
      _avg: {
        mapPackVisibility: true,
        top3Count: true,
        top10Count: true,
        top20Count: true,
        shareOfVoice: true,
      },
    });

    return {
      avgMapPackVisibility: result._avg.mapPackVisibility,
      avgTop3Count: result._avg.top3Count,
      avgTop10Count: result._avg.top10Count,
      avgTop20Count: result._avg.top20Count,
      avgShareOfVoice: result._avg.shareOfVoice,
    };
  }

  /**
   * Compare metrics between two periods
   */
  async comparePeriods(
    businessId: string,
    period1Start: Date,
    period1End: Date,
    period2Start: Date,
    period2End: Date,
    locationId?: string
  ): Promise<{
    period1: VisibilityMetric[];
    period2: VisibilityMetric[];
  }> {
    const [period1, period2] = await Promise.all([
      this.findByPeriod(businessId, 'daily', period1Start, period1End),
      this.findByPeriod(businessId, 'daily', period2Start, period2End),
    ]);

    return { period1, period2 };
  }

  /**
   * Delete old metrics (for data retention)
   */
  async deleteOlderThan(cutoffDate: Date): Promise<Prisma.BatchPayload> {
    return this.delegate.deleteMany({
      where: {
        periodStart: {
          lt: cutoffDate,
        },
      },
    });
  }
}

// Export singleton instance
export const visibilityMetricRepository = new VisibilityMetricRepository();
