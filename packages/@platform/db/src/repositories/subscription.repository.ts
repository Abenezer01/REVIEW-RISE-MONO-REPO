import { Prisma, Subscription } from '@prisma/client';
import { prisma } from '../client';
import { BaseRepository } from './base.repository';

/**
 * Subscription Repository
 * 
 * Handles all database operations related to business subscriptions.
 */
export class SubscriptionRepository extends BaseRepository<
    Subscription,
    typeof prisma.subscription,
    Prisma.SubscriptionWhereInput,
    Prisma.SubscriptionOrderByWithRelationInput,
    Prisma.SubscriptionCreateInput,
    Prisma.SubscriptionUpdateInput
> {
    constructor() {
        super(prisma.subscription, 'Subscription');
    }

    /**
     * Find active subscription for a business
     */
    async findActiveByBusinessId(businessId: string): Promise<Subscription | null> {
        return this.delegate.findFirst({
            where: {
                businessId,
                status: 'active',
                deletedAt: null,
            },
            orderBy: {
                currentPeriodEnd: 'desc',
            },
        });
    }

    /**
     * Find subscription with business details
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
     * Find all subscriptions for a business
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
     * Find subscriptions expiring soon
     */
    async findExpiringSoon(days: number = 7) {
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + days);

        return this.delegate.findMany({
            where: {
                status: 'active',
                currentPeriodEnd: {
                    lte: expiryDate,
                    gte: new Date(),
                },
                deletedAt: null,
            },
            include: {
                business: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                    },
                },
            },
            orderBy: {
                currentPeriodEnd: 'asc',
            },
        });
    }

    /**
     * Find expired subscriptions
     */
    async findExpired() {
        return this.delegate.findMany({
            where: {
                status: 'active',
                currentPeriodEnd: {
                    lt: new Date(),
                },
                deletedAt: null,
            },
            include: {
                business: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                    },
                },
            },
            orderBy: {
                currentPeriodEnd: 'asc',
            },
        });
    }

    /**
     * Update subscription status
     */
    async updateStatus(id: string, status: string) {
        return this.delegate.update({
            where: { id },
            data: { status },
        });
    }

    /**
     * Renew subscription (extend period)
     */
    async renew(id: string, periodDays: number = 30) {
        const subscription = await this.findById(id);
        if (!subscription) {
            throw new Error('Subscription not found');
        }

        const newPeriodEnd = new Date(subscription.currentPeriodEnd);
        newPeriodEnd.setDate(newPeriodEnd.getDate() + periodDays);

        return this.delegate.update({
            where: { id },
            data: {
                currentPeriodEnd: newPeriodEnd,
                status: 'active',
            },
        });
    }

    /**
     * Cancel subscription
     */
    async cancel(id: string) {
        return this.delegate.update({
            where: { id },
            data: {
                status: 'canceled',
            },
        });
    }

    /**
     * Create subscription for business
     */
    async createForBusiness(
        businessId: string,
        plan: string,
        periodDays: number = 30
    ) {
        const currentPeriodEnd = new Date();
        currentPeriodEnd.setDate(currentPeriodEnd.getDate() + periodDays);

        return this.delegate.create({
            data: {
                businessId,
                plan,
                status: 'active',
                currentPeriodEnd,
            },
            include: {
                business: true,
            },
        });
    }

    /**
     * Get subscription statistics
     */
    async getStats() {
        const now = new Date();
        const sevenDaysFromNow = new Date();
        sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

        const [total, active, canceled, expired, expiringSoon] = await Promise.all([
            this.count({ deletedAt: null }),
            this.count({ status: 'active', deletedAt: null }),
            this.count({ status: 'canceled', deletedAt: null }),
            this.delegate.count({
                where: {
                    status: 'active',
                    currentPeriodEnd: { lt: now },
                    deletedAt: null,
                },
            }),
            this.delegate.count({
                where: {
                    status: 'active',
                    currentPeriodEnd: {
                        gte: now,
                        lte: sevenDaysFromNow,
                    },
                    deletedAt: null,
                },
            }),
        ]);

        return {
            total,
            active,
            canceled,
            expired,
            expiringSoon,
        };
    }

    /**
     * Get subscriptions by plan
     */
    async findByPlan(plan: string) {
        return this.delegate.findMany({
            where: {
                plan,
                deletedAt: null,
            },
            include: {
                business: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    /**
     * Get plan distribution statistics
     */
    async getPlanDistribution() {
        const subscriptions = await this.delegate.findMany({
            where: {
                status: 'active',
                deletedAt: null,
            },
            select: {
                plan: true,
            },
        });

        const distribution: Record<string, number> = {};
        subscriptions.forEach((sub) => {
            distribution[sub.plan] = (distribution[sub.plan] || 0) + 1;
        });

        return distribution;
    }
}

// Export singleton instance
export const subscriptionRepository = new SubscriptionRepository();
