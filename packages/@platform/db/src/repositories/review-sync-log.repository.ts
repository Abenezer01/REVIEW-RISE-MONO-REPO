import { Prisma, ReviewSyncLog } from '@prisma/client';
import { prisma } from '../client';
import { BaseRepository } from './base.repository';

export class ReviewSyncLogRepository extends BaseRepository<
  ReviewSyncLog,
  Prisma.ReviewSyncLogDelegate,
  Prisma.ReviewSyncLogWhereInput,
  Prisma.ReviewSyncLogOrderByWithRelationInput,
  Prisma.ReviewSyncLogCreateInput,
  Prisma.ReviewSyncLogUpdateInput
> {
  constructor() {
    if (!prisma.reviewSyncLog) {
      throw new Error('ReviewSyncLog model is not defined in Prisma Client. Please run "prisma generate".');
    }
    super(prisma.reviewSyncLog, 'ReviewSyncLog');
  }

  /**
   * Find logs with filtering
   */
  async findLogs(options: {
    page?: number;
    limit?: number;
    status?: string | string[];
    businessId?: string;
    locationId?: string;
    platform?: string;
    fromDate?: Date;
    toDate?: Date;
    search?: string;
  }) {
    const { page = 1, limit = 10, status, businessId, locationId, platform, fromDate, toDate, search } = options;
    const skip = (page - 1) * limit;

    const where: Prisma.ReviewSyncLogWhereInput = {};

    if (status) {
      if (Array.isArray(status)) {
        where.status = { in: status };
      } else {
        where.status = status;
      }
    }

    if (platform) {
      where.platform = platform;
    }

    if (businessId) {
      where.businessId = businessId;
    }

    if (locationId) {
      where.locationId = locationId;
    }

    if (fromDate || toDate) {
      where.createdAt = {};
      if (fromDate) where.createdAt.gte = fromDate;
      if (toDate) where.createdAt.lte = toDate;
    }

    if (search) {
      // Search by ID or Error Message
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(search);

      if (isUuid) {
        where.OR = [
            { id: search },
            { jobId: search }
        ];
      } else {
        where.OR = [
          { errorMessage: { contains: search, mode: 'insensitive' } },
          { platform: { contains: search, mode: 'insensitive' } },
          { business: { name: { contains: search, mode: 'insensitive' } } },
          { location: { name: { contains: search, mode: 'insensitive' } } },
        ];
      }
    }

    const [items, total] = await Promise.all([
      this.delegate.findMany({
        where,
        take: limit,
        skip,
        orderBy: { createdAt: 'desc' },
        include: {
          business: { select: { name: true } },
          location: {
            select: {
              id: true,
              name: true,
              address: true
            }
          },
          job: {
            select: {
              id: true,
              retryCount: true,
              status: true
            }
          }
        },
      }),
      this.delegate.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Create a log entry
   */
  async createLog(data: Prisma.ReviewSyncLogCreateInput) {
    return this.create(data);
  }
}

export const reviewSyncLogRepository = new ReviewSyncLogRepository();
