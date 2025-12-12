import { Prisma, User } from '@prisma/client';
import { prisma } from '../client';
import { BaseRepository } from './base.repository';

/**
 * User Repository
 * 
 * Handles all database operations related to users.
 * Provides type-safe methods for user management.
 */
export class UserRepository extends BaseRepository<
    User,
    typeof prisma.user,
    Prisma.UserWhereInput,
    Prisma.UserOrderByWithRelationInput,
    Prisma.UserCreateInput,
    Prisma.UserUpdateInput
> {
    constructor() {
        super(prisma.user, 'User');
    }

    /**
     * Find user by email address
     */
    async findByEmail(email: string): Promise<User | null> {
        return this.delegate.findUnique({
            where: { email },
        });
    }

    /**
     * Find user with their sessions
     */
    async findWithSessions(id: string) {
        return this.delegate.findUnique({
            where: { id },
            include: {
                sessions: {
                    where: {
                        expires: {
                            gte: new Date(),
                        },
                    },
                    orderBy: {
                        expires: 'desc',
                    },
                },
            },
        });
    }

    /**
     * Find user with their business roles
     */
    async findWithRoles(id: string) {
        return this.delegate.findUnique({
            where: { id },
            include: {
                roles: {
                    where: {
                        deletedAt: null,
                    },
                    include: {
                        business: true,
                        role: {
                            include: {
                                permissions: {
                                    include: {
                                        permission: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });
    }

    /**
     * Find all active users (not soft-deleted)
     */
    async findActiveUsers(options?: {
        take?: number;
        skip?: number;
        orderBy?: Prisma.UserOrderByWithRelationInput;
    }): Promise<User[]> {
        return this.findManyActive(options);
    }

    /**
     * Create user with initial role assignment
     */
    async createWithRole(
        userData: Prisma.UserCreateInput,
        roleAssignment: {
            businessId: string;
            roleId: string;
        }
    ) {
        return this.transaction(async (tx) => {
            // Create user
            const user = await tx.user.create({
                data: userData,
            });

            // Assign role
            await tx.userBusinessRole.create({
                data: {
                    userId: user.id,
                    businessId: roleAssignment.businessId,
                    roleId: roleAssignment.roleId,
                },
            });

            // Return user with role
            return tx.user.findUnique({
                where: { id: user.id },
                include: {
                    roles: {
                        include: {
                            business: true,
                            role: true,
                        },
                    },
                },
            });
        });
    }

    /**
     * Update user email (with verification reset)
     */
    async updateEmail(id: string, newEmail: string) {
        return this.delegate.update({
            where: { id },
            data: {
                email: newEmail,
                emailVerified: null, // Reset verification when email changes
            },
        });
    }

    /**
     * Mark email as verified
     */
    async verifyEmail(id: string) {
        return this.delegate.update({
            where: { id },
            data: {
                emailVerified: new Date(),
            },
        });
    }

    /**
     * Find users by business ID
     */
    async findByBusinessId(businessId: string) {
        return this.delegate.findMany({
            where: {
                roles: {
                    some: {
                        businessId,
                        deletedAt: null,
                    },
                },
                deletedAt: null,
            },
            include: {
                roles: {
                    where: {
                        businessId,
                        deletedAt: null,
                    },
                    include: {
                        role: true,
                    },
                },
            },
        });
    }

    /**
     * Search users by name or email
     */
    async search(query: string, options?: { take?: number; skip?: number }) {
        return this.delegate.findMany({
            where: {
                OR: [
                    {
                        email: {
                            contains: query,
                            mode: 'insensitive',
                        },
                    },
                    {
                        name: {
                            contains: query,
                            mode: 'insensitive',
                        },
                    },
                ],
                deletedAt: null,
            },
            take: options?.take,
            skip: options?.skip,
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    /**
     * Get user statistics
     */
    async getStats() {
        const [total, active, verified] = await Promise.all([
            this.count({}),
            this.count({ deletedAt: null }),
            this.count({ emailVerified: { not: null }, deletedAt: null }),
        ]);

        return {
            total,
            active,
            verified,
            unverified: active - verified,
        };
    }
}

// Export singleton instance
export const userRepository = new UserRepository();
