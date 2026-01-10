import { Prisma, BrandDNA } from '@prisma/client';
import { prisma } from '../client';
import { BaseRepository } from './base.repository';

export class BrandDNARepository extends BaseRepository<
    BrandDNA,
    typeof prisma.brandDNA,
    Prisma.BrandDNAWhereInput,
    Prisma.BrandDNAOrderByWithRelationInput,
    Prisma.BrandDNACreateInput,
    Prisma.BrandDNAUpdateInput
> {
    constructor() {
        super(prisma.brandDNA, 'BrandDNA');
    }

    async findByBusinessId(businessId: string) {
        return this.findFirst({
            where: { businessId },
        });
    }
}

export const brandDNARepository = new BrandDNARepository();
