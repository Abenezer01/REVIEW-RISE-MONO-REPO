import { prisma } from '@platform/db';

export const getBrandOverview = async (businessId: string) => {
    // Fetch latest visibility snapshot based on most recent capturedAt
    const latestVisibility = await prisma.visibilitySnapshot.findFirst({
        where: { businessId },
        orderBy: { capturedAt: 'desc' },
    });

    // Count competitors
    const competitorCount = await prisma.competitor.count({
        where: { businessId },
    });

    // Get recent reports
    const recentReports = await prisma.report.findMany({
        where: { businessId },
        orderBy: { generatedAt: 'desc' },
        take: 5,
    });

    return {
        visibilityScore: latestVisibility?.score || 0,
        competitorCount,
        recentReportCount: recentReports.length,
        latestSnapshotDate: latestVisibility?.capturedAt || null,
    };
};

export const getVisibilityMetrics = async (businessId: string, range: '7d' | '30d' | '90d' = '30d') => {
    // Calculate start date based on range
    const now = new Date();
    const startDate = new Date();
    if (range === '7d') startDate.setDate(now.getDate() - 7);
    if (range === '90d') startDate.setDate(now.getDate() - 90);
    else startDate.setDate(now.getDate() - 30); // Default 30d

    const snapshots = await prisma.visibilitySnapshot.findMany({
        where: {
            businessId,
            capturedAt: {
                gte: startDate,
            },
        },
        orderBy: { capturedAt: 'asc' },
    });

    return snapshots.map((s: any) => ({
        date: s.capturedAt,
        score: s.score,
        breakdown: s.breakdown,
    }));
};
