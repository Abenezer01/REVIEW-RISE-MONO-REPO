import { Prisma, BrandRecommendation } from '@prisma/client';
import { prisma } from '../client';
import { BaseRepository } from './base.repository';

/**
 * Brand Recommendation Repository
 * 
 * Handles all database operations related to AI-generated brand recommendations.
 * Provides type-safe methods for recommendation management, filtering, and prioritization.
 */
export class BrandRecommendationRepository extends BaseRepository<
    BrandRecommendation,
    typeof prisma.brandRecommendation,
    Prisma.BrandRecommendationWhereInput,
    Prisma.BrandRecommendationOrderByWithRelationInput,
    Prisma.BrandRecommendationCreateInput,
    Prisma.BrandRecommendationUpdateInput
> {
    constructor() {
        super(prisma.brandRecommendation, 'BrandRecommendation');
    }

    /**
     * Find recommendations by business ID with advanced filtering
     */
    async findByBusinessId(
        businessId: string,
        filters?: {
            category?: string;
            status?: string;
            sortBy?: 'priorityScore' | 'generatedAt';
            order?: 'asc' | 'desc';
            limit?: number;
            offset?: number;
        }
    ): Promise<BrandRecommendation[]> {
        const where: Prisma.BrandRecommendationWhereInput = {
            businessId,
            ...(filters?.category && { category: filters.category }),
            ...(filters?.status && { status: filters.status }),
        };

        const orderBy: Prisma.BrandRecommendationOrderByWithRelationInput = {
            [filters?.sortBy || 'priorityScore']: filters?.order || 'desc',
        };

        return this.delegate.findMany({
            where,
            orderBy,
            take: filters?.limit,
            skip: filters?.offset,
        });
    }

    /**
     * Update recommendation status with automatic timestamp tracking
     */
    async updateStatus(
        id: string,
        status: string,
        notes?: string
    ): Promise<BrandRecommendation> {
        const updateData: Prisma.BrandRecommendationUpdateInput = {
            status,
            ...(notes && { notes }),
            ...(status === 'done' && { completedAt: new Date() }),
            ...(status === 'dismissed' && { dismissedAt: new Date() }),
        };

        return this.update(id, updateData);
    }

    /**
     * Get recommendation statistics by business
     */
    async getStatsByBusiness(businessId: string) {
        const recommendations = await this.delegate.findMany({
            where: { businessId },
            select: {
                status: true,
                category: true,
                impact: true,
            },
        });

        return {
            total: recommendations.length,
            byStatus: this.groupBy(recommendations, 'status'),
            byCategory: this.groupBy(recommendations, 'category'),
            byImpact: this.groupBy(recommendations, 'impact'),
        };
    }

    /**
     * Get top priority recommendations
     */
    async getTopPriority(businessId: string, limit: number = 10): Promise<BrandRecommendation[]> {
        return this.delegate.findMany({
            where: {
                businessId,
                status: { in: ['open', 'in_progress'] },
            },
            orderBy: {
                priorityScore: 'desc',
            },
            take: limit,
        });
    }

    /**
     * Get recommendations by category
     */
    async findByCategory(businessId: string, category: string): Promise<BrandRecommendation[]> {
        return this.delegate.findMany({
            where: {
                businessId,
                category,
            },
            orderBy: {
                priorityScore: 'desc',
            },
        });
    }

    /**
     * Count open recommendations
     */
    async countOpen(businessId: string): Promise<number> {
        return this.count({
            businessId,
            status: 'open',
        });
    }

    /**
     * Count completed recommendations
     */
    async countCompleted(businessId: string): Promise<number> {
        return this.count({
            businessId,
            status: 'done',
        });
    }

    /**
     * Helper method to group items by a key
     */
    private groupBy(items: any[], key: string): Record<string, number> {
        return items.reduce((acc, item) => {
            const value = item[key];
            acc[value] = (acc[value] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
    }

    /**
     * Bulk create recommendations
     */
    async createBulk(recommendations: Prisma.BrandRecommendationCreateInput[]): Promise<{ count: number }> {
        return this.createMany(recommendations);
    }

    /**
     * Delete old dismissed recommendations (cleanup)
     */
    async deleteOldDismissed(businessId: string, daysOld: number = 90): Promise<{ count: number }> {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysOld);

        return this.deleteMany({
            businessId,
            status: 'dismissed',
            dismissedAt: {
                lt: cutoffDate,
            },
        });
    }
}

// Export singleton instance
export const brandRecommendationRepository = new BrandRecommendationRepository();
