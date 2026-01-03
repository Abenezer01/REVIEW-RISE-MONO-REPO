import { prisma, CompetitorType } from '@platform/db';

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
            website,
            source: 'manual',
            type: CompetitorType.UNKNOWN,
            isUserAdded: true
        }
    });
};

export const updateCompetitor = async (id: string, businessId: string, data: any) => {
    return prisma.competitor.update({
        where: { id, businessId },
        data
    });
};

export const hideCompetitor = async (id: string, businessId: string) => {
    return prisma.competitor.update({
        where: { id, businessId },
        data: { isHidden: true }
    });
};

export const unhideCompetitor = async (id: string, businessId: string) => {
    return prisma.competitor.update({
        where: { id, businessId },
        data: { isHidden: false }
    });
};

export const reorderCompetitors = async (businessId: string, orderedIds: string[]) => {
    // Transactional update for ranking
    const updates = orderedIds.map((id, index) => 
        prisma.competitor.update({
            where: { id, businessId },
            data: { ranking: index + 1 }
        })
    );
    return prisma.$transaction(updates);
};

export const removeCompetitor = async (id: string, businessId: string) => {
    return prisma.competitor.delete({
        where: { id, businessId } // Ensure ownership
    });
};

export const getCompetitor = async (id: string, businessId: string) => {
    return prisma.competitor.findUnique({
        where: { id, businessId },
        include: {
            snapshots: {
                orderBy: { capturedAt: 'desc' },
                take: 1
            }
        }
    });
};
