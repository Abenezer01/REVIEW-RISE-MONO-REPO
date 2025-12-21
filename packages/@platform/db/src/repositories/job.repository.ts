import { Prisma, Job } from '@prisma/client';
import { prisma } from '../client';
import { BaseRepository } from './base.repository';

export class JobRepository extends BaseRepository<
  Job,
  Prisma.JobDelegate,
  Prisma.JobWhereInput,
  Prisma.JobOrderByWithRelationInput,
  Prisma.JobCreateInput,
  Prisma.JobUpdateInput
> {
  constructor() {
    super(prisma.job, 'Job');
  }

  /**
   * Find jobs with comprehensive filtering
   */
  async findJobs(options: {
    page?: number;
    limit?: number;
    type?: string[];
    status?: string | string[];
    businessId?: string;
    locationId?: string;
    fromDate?: Date;
    toDate?: Date;
    search?: string;
    platform?: string;
  }) {
    const { page = 1, limit = 10, type, status, businessId, locationId, fromDate, toDate, search, platform } = options;
    const skip = (page - 1) * limit;

    const where: Prisma.JobWhereInput = {};

    if (status) {
      if (Array.isArray(status)) {
        where.status = { in: status };
      } else {
        where.status = status;
      }
    }

    if (type && type.length > 0) {
      where.type = { in: type };
    }

    if (platform) {
      where.payload = {
        path: ['platform'],
        equals: platform
      };
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
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(search);

      if (isUuid) {
        where.id = search;
      } else {
        where.OR = [
          { type: { contains: search, mode: 'insensitive' } },
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
          location: { select: { name: true } },
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
   * Retry a failed job
   */
  async retryJob(id: string) {
    const job = await this.findById(id);
    if (!job) throw new Error('Job not found');

    if (job.status !== 'failed' && job.status !== 'cancelled') {
      throw new Error('Only failed or cancelled jobs can be retried');
    }

    return this.update(id, {
      status: 'pending',
      retryCount: { increment: 1 },
      error: Prisma.DbNull, // Clear error
      failedAt: null,
      startedAt: null,
      completedAt: null,
    });
  }

  /**
   * Mark job as resolved (manual intervention)
   */
  async resolveJob(id: string, notes?: string) {
    return this.update(id, {
      status: 'resolved',
      result: notes ? { notes, resolvedBy: 'admin', resolvedAt: new Date() } : undefined,
      completedAt: new Date(),
    });
  }

  /**
   * Ignore a failed job
   */
  async ignoreJob(id: string, notes?: string) {
    return this.update(id, {
      status: 'ignored',
      result: notes ? { notes, ignoredBy: 'admin', ignoredAt: new Date() } : undefined,
    });
  }

  /**
   * Bulk retry jobs
   */
  async bulkRetry(ids: string[]) {
    return this.delegate.updateMany({
      where: {
        id: { in: ids },
        status: { in: ['failed', 'cancelled'] },
      },
      data: {
        status: 'pending',
        retryCount: { increment: 1 },
        error: Prisma.DbNull,
        failedAt: null,
        startedAt: null,
        completedAt: null,
      },
    });
  }
}

export const jobRepository = new JobRepository();
