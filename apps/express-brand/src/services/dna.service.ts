import { prisma } from '@platform/db';

export const getDNA = async (businessId: string) => {
    return prisma.brandDNA.findUnique({
        where: { businessId },
    });
};

export const upsertDNA = async (businessId: string, data: {
    values: string[];
    voice?: string;
    audience?: string;
    mission?: string;
}) => {
    return prisma.brandDNA.upsert({
        where: { businessId },
        update: data,
        create: {
            businessId,
            ...data,
        },
    });
};
