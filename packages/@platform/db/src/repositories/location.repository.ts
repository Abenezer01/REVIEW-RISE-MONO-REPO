import { Prisma, Location } from '@prisma/client';
import { prisma } from '../client';
import { BaseRepository } from './base.repository';

/**
 * Location Repository
 * 
 * Handles all database operations related to business locations.
 */
export class LocationRepository extends BaseRepository<
    Location,
    typeof prisma.location,
    Prisma.LocationWhereInput,
    Prisma.LocationOrderByWithRelationInput,
    Prisma.LocationCreateInput,
    Prisma.LocationUpdateInput
> {
    constructor() {
        super(prisma.location, 'Location');
    }

    /**
     * Find all locations for a specific business
     */
    async findByBusinessId(businessId: string) {
        return this.delegate.findMany({
            where: {
                businessId,
                deletedAt: null,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    /**
     * Find location with business details
     */
    async findWithBusiness(id: string) {
        return this.delegate.findUnique({
            where: { id },
            include: {
                business: true,
            },
        });
    }

    /**
     * Create location for a business
     */
    async createForBusiness(
        businessId: string,
        locationData: Omit<Prisma.LocationCreateInput, 'business'>
    ) {
        return this.delegate.create({
            data: {
                ...locationData,
                business: {
                    connect: { id: businessId },
                },
            },
            include: {
                business: true,
            },
        });
    }

    /**
     * Update location details
     */
    async update(id: string, data: Prisma.LocationUpdateInput) {
        return this.delegate.update({
            where: { id },
            data,
            include: {
                business: true,
            },
        });
    }

    /**
     * Soft delete location
     */
    async delete(id: string) {
        return this.delegate.update({
            where: { id },
            data: {
                deletedAt: new Date(),
                status: 'archived',
            },
        });
    }

    /**
     * Count locations for a business
     */
    async countByBusinessId(businessId: string): Promise<number> {
        return this.count({
            businessId,
            deletedAt: null,
        });
    }

    /**
     * Search locations by name or address (Admin usage with filtering)
     */
    async list(
        filters: {
            businessId?: string;
            status?: string;
            search?: string;
        },
        options?: { take?: number; skip?: number }
    ) {
        const where: Prisma.LocationWhereInput = {
            deletedAt: null,
            ...(filters.businessId && { businessId: filters.businessId }),
            ...(filters.status && { status: filters.status }),
            ...(filters.search && {
                OR: [
                    { name: { contains: filters.search, mode: 'insensitive' } },
                    { address: { contains: filters.search, mode: 'insensitive' } },
                ],
            }),
        };

        const [items, total] = await Promise.all([
            this.delegate.findMany({
                where,
                take: options?.take,
                skip: options?.skip,
                orderBy: { createdAt: 'desc' },
                include: { business: true },
            }),
            this.delegate.count({ where }),
        ]);

        return { items, total };
    }

    /**
     * Search locations by name or address (Legacy/Simple)
     */
    async search(
        query: string,
        businessId?: string,
        options?: { take?: number; skip?: number }
    ) {
        return this.delegate.findMany({
            where: {
                OR: [
                    {
                        name: {
                            contains: query,
                            mode: 'insensitive',
                        },
                    },
                    {
                        address: {
                            contains: query,
                            mode: 'insensitive',
                        },
                    },
                ],
                businessId,
                deletedAt: null,
            },
            take: options?.take,
            skip: options?.skip,
            orderBy: {
                name: 'asc',
            },
        });
    }

    /**
     * Bulk create locations for a business
     */
    async createManyForBusiness(
        businessId: string,
        locations: Array<{
            name: string;
            address?: string;
        }>
    ) {
        return this.transaction(async (tx) => {
            const created = await Promise.all(
                locations.map((location) =>
                    tx.location.create({
                        data: {
                            name: location.name,
                            address: location.address,
                            businessId,
                        },
                    })
                )
            );

            return created;
        });
    }
}

// Export singleton instance
export const locationRepository = new LocationRepository();

