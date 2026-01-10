import { Prisma, BrandProfile } from '@prisma/client';
import { prisma } from '../client';
import { BaseRepository } from './base.repository';

export class BrandProfileRepository extends BaseRepository<
    BrandProfile,
    typeof prisma.brandProfile,
    Prisma.BrandProfileWhereInput,
    Prisma.BrandProfileOrderByWithRelationInput,
    Prisma.BrandProfileCreateInput,
    Prisma.BrandProfileUpdateInput
> {
    constructor() {
        super(prisma.brandProfile, 'BrandProfile');
    }

    async findByBusinessId(businessId: string) {
        return this.findFirst({
            where: { businessId },
        });
    }
}

export const brandProfileRepository = new BrandProfileRepository();
