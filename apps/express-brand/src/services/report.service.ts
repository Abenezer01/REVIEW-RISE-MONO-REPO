import { prisma } from '@platform/db';

export const listReports = async (businessId: string) => {
    return prisma.report.findMany({
        where: { businessId },
        select: { id: true, title: true, version: true, generatedAt: true, generatedBy: true }, // Exclude heavy htmlContent
        orderBy: { generatedAt: 'desc' },
    });
};

export const getReportContent = async (id: string, businessId: string) => {
    return prisma.report.findFirst({
        where: { id, businessId }
    });
};
