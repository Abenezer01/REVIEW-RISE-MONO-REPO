import { Prisma, Competitor } from '@prisma/client';
import { prisma } from '../client';
import { BaseRepository } from './base.repository';

export class CompetitorRepository extends BaseRepository<
    Competitor,
    typeof prisma.competitor,
    Prisma.CompetitorWhereInput,
    Prisma.CompetitorOrderByWithRelationInput,
    Prisma.CompetitorCreateInput,
    Prisma.CompetitorUpdateInput
> {
    constructor() {
        super(prisma.competitor, 'Competitor');
    }

    async findByBusinessId(businessId: string) {
        return this.delegate.findMany({
            where: { businessId },
        });
    }
}

export const competitorRepository = new CompetitorRepository();
