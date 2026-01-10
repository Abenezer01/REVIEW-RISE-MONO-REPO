import { Prisma, Report } from '@prisma/client';
import { prisma } from '../client';
import { BaseRepository } from './base.repository';

export class ReportRepository extends BaseRepository<
    Report,
    typeof prisma.report,
    Prisma.ReportWhereInput,
    Prisma.ReportOrderByWithRelationInput,
    Prisma.ReportCreateInput,
    Prisma.ReportUpdateInput
> {
    constructor() {
        super(prisma.report, 'Report');
    }

    async findByBusinessId(businessId: string) {
        return this.delegate.findMany({
            where: { businessId },
            orderBy: { generatedAt: 'desc' },
        });
    }
}

export const reportRepository = new ReportRepository();
