import { prisma } from '@platform/db';

export const listContent = async (businessId: string) => {
    return prisma.contentIdea.findMany({
        where: { businessId },
        orderBy: { createdAt: 'desc' },
    });
};

export const createContent = async (businessId: string, data: {
    title: string;
    description?: string;
    platform: string;
    status?: string;
}) => {
    return prisma.contentIdea.create({
        data: {
            businessId,
            ...data,
        },
    });
};

export const updateContent = async (id: string, businessId: string, data: Partial<{
    title: string;
    description: string;
    platform: string;
    status: string;
}>) => {
    return prisma.contentIdea.update({
        where: { id, businessId }, // Ensure ownership
        data,
    });
};

export const deleteContent = async (id: string, businessId: string) => {
    return prisma.contentIdea.delete({
        where: { id, businessId },
    });
};
