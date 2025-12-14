import { Prisma, Business } from '@prisma/client';
import { prisma } from '../client';
import { BaseRepository } from './base.repository';

/**
 * Business Repository
 * 
 * Handles all database operations related to businesses.
 * Provides type-safe methods for business management.
 */
export class BusinessRepository extends BaseRepository<
    Business,
    typeof prisma.business,
    Prisma.BusinessWhereInput,
    Prisma.BusinessOrderByWithRelationInput,
    Prisma.BusinessCreateInput,
    Prisma.BusinessUpdateInput
> {
    constructor() {
        super(prisma.business, 'Business');
    }

    /**
     * Find business by slug
     */
    async findBySlug(slug: string): Promise<Business | null> {
        return this.delegate.findUnique({
            where: { slug },
        });
    }

    /**
     * Find business with all locations
     */
    async findWithLocations(id: string) {
        return this.delegate.findUnique({
            where: { id },
            include: {
                locations: {
                    where: {
                        deletedAt: null,
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                },
            },
        });
    }

    /**
     * Find business with active subscription
     */
    async findWithSubscription(id: string) {
        return this.delegate.findUnique({
            where: { id },
            include: {
                subscriptions: {
                    where: {
                        deletedAt: null,
                        status: 'active',
                    },
                    orderBy: {
                        currentPeriodEnd: 'desc',
                    },
                    take: 1,
                },
            },
        });
    }

    /**
     * Check if slug is available
     */
    async isSlugAvailable(slug: string, excludeId?: string): Promise<boolean> {
        const existing = await this.delegate.findFirst({
            where: {
                slug,
                id: excludeId ? { not: excludeId } : undefined,
            },
        });

        return !existing;
    }

    /**
     * Generate unique slug from business name
     */
    async generateUniqueSlug(name: string): Promise<string> {
        const baseSlug = name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');

        let slug = baseSlug;
        let counter = 1;

        while (!(await this.isSlugAvailable(slug))) {
            slug = `${baseSlug}-${counter}`;
            counter++;
        }

        return slug;
    }

    /**
     * Search businesses by name
     */
    async search(query: string, options?: { take?: number; skip?: number }) {
        return this.delegate.findMany({
            where: {
                name: {
                    contains: query,
                    mode: 'insensitive',
                },
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
     * Get business statistics
     */
    async getStats() {
        const [total, active, withActiveSubscription] = await Promise.all([
            this.count({}),
            this.count({ deletedAt: null }),
            this.delegate.count({
                where: {
                    deletedAt: null,
                    subscriptions: {
                        some: {
                            status: 'active',
                            deletedAt: null,
                        },
                    },
                },
            }),
        ]);

        return {
            total,
            active,
            withActiveSubscription,
            withoutSubscription: active - withActiveSubscription,
        };
    }
}

// Export singleton instance
export const businessRepository = new BusinessRepository();
