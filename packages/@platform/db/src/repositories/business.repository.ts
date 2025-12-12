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
     * Find business with team members and their roles
     */
    async findWithTeam(id: string) {
        return this.delegate.findUnique({
            where: { id },
            include: {
                userRoles: {
                    where: {
                        deletedAt: null,
                    },
                    include: {
                        user: {
                            select: {
                                id: true,
                                email: true,
                                name: true,
                                image: true,
                            },
                        },
                        role: {
                            select: {
                                id: true,
                                name: true,
                                description: true,
                            },
                        },
                    },
                    orderBy: {
                        createdAt: 'asc',
                    },
                },
            },
        });
    }

    /**
     * Create business with owner
     */
    async createWithOwner(
        businessData: Omit<Prisma.BusinessCreateInput, 'userRoles'>,
        ownerId: string,
        ownerRoleId: string
    ) {
        return this.transaction(async (tx) => {
            // Create business
            const business = await tx.business.create({
                data: businessData,
            });

            // Assign owner role
            await tx.userBusinessRole.create({
                data: {
                    userId: ownerId,
                    businessId: business.id,
                    roleId: ownerRoleId,
                },
            });

            // Return business with owner
            return tx.business.findUnique({
                where: { id: business.id },
                include: {
                    userRoles: {
                        include: {
                            user: true,
                            role: true,
                        },
                    },
                },
            });
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
     * Find businesses by user ID
     */
    async findByUserId(userId: string) {
        return this.delegate.findMany({
            where: {
                userRoles: {
                    some: {
                        userId,
                        deletedAt: null,
                    },
                },
                deletedAt: null,
            },
            include: {
                userRoles: {
                    where: {
                        userId,
                        deletedAt: null,
                    },
                    include: {
                        role: true,
                    },
                },
                subscriptions: {
                    where: {
                        deletedAt: null,
                        status: 'active',
                    },
                    take: 1,
                    orderBy: {
                        currentPeriodEnd: 'desc',
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
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

    /**
     * Add team member to business
     */
    async addTeamMember(businessId: string, userId: string, roleId: string) {
        return prisma.userBusinessRole.create({
            data: {
                businessId,
                userId,
                roleId,
            },
            include: {
                user: true,
                role: true,
            },
        });
    }

    /**
     * Remove team member from business
     */
    async removeTeamMember(businessId: string, userId: string) {
        return prisma.userBusinessRole.updateMany({
            where: {
                businessId,
                userId,
                deletedAt: null,
            },
            data: {
                deletedAt: new Date(),
            },
        });
    }

    /**
     * Update team member role
     */
    async updateTeamMemberRole(
        businessId: string,
        userId: string,
        newRoleId: string
    ) {
        return this.transaction(async (tx) => {
            // Soft delete old role assignment
            await tx.userBusinessRole.updateMany({
                where: {
                    businessId,
                    userId,
                    deletedAt: null,
                },
                data: {
                    deletedAt: new Date(),
                },
            });

            // Create new role assignment
            return tx.userBusinessRole.create({
                data: {
                    businessId,
                    userId,
                    roleId: newRoleId,
                },
                include: {
                    user: true,
                    role: true,
                },
            });
        });
    }
}

// Export singleton instance
export const businessRepository = new BusinessRepository();
