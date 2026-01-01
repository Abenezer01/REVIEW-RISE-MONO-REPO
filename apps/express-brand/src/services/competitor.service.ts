import { prisma } from '@platform/db';

export const listCompetitors = async (businessId: string) => {
    return prisma.competitor.findMany({
        where: { businessId },
        include: {
            snapshots: {
                orderBy: { capturedAt: 'desc' },
                take: 1
            }
        }
    });
};

export const addCompetitor = async (businessId: string, name: string, website?: string) => {
    // Check limit? (Assuming 5 for now or unlimited)
    return prisma.competitor.create({
        data: {
            businessId,
            name,
            website
        }
    });
};

export const removeCompetitor = async (id: string, businessId: string) => {
    return prisma.competitor.delete({
        where: { id, businessId } // Ensure ownership
    });
};
