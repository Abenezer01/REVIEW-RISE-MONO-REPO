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
        const [total, verified] = await Promise.all([
            this.count({}),
            this.count({ emailVerified: { not: null } }),
        ]);

        return {
            total,
            active: total,
            verified,
            unverified: total - verified,
        };
    }
    /**
     * Find user by email with roles
     */
    async findByEmailWithRoles(email: string) {
        return this.delegate.findUnique({
            where: { email },
            include: {
                userRoles: {
                    include: {
                        role: true,
                    },
                },
            },
        });
    }

    /**
     * Create user with "Customer" role
     */
    async createCustomer(data: Prisma.UserCreateInput) {
        const customerRole = await prisma.role.findUnique({
            where: { name: 'Customer' },
        });

        if (!customerRole) {
            throw new Error('Default Customer role not found in database');
        }

        return this.delegate.create({
            data: {
                ...data,
                userRoles: {
                    create: {
                        role: {
                            connect: { id: customerRole.id },
                        },
                    },
                },
            },
        });
    }

    /**
     * Update user password
     */
    async updatePassword(id: string, password: string) {
        return this.delegate.update({
            where: { id },
            data: { password },
        });
    }
}

// Export singleton instance
export const userRepository = new UserRepository();
