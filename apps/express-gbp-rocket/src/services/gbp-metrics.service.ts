import { prisma } from '@platform/db';
import dayjs from 'dayjs';

export class GbpMetricsService {
    /**
     * Mock ingestion of metrics for a location for a specific date
     */
    async ingestLocationMetrics(locationId: string, date: string | Date = new Date()) {
        const targetDate = dayjs(date).startOf('day').toDate();

        // Mock data generation
        const impressionsDiscovery = Math.floor(Math.random() * 500) + 100;
        const impressionsDirect = Math.floor(Math.random() * 200) + 50;
        const impressionsTotal = impressionsDiscovery + impressionsDirect;
        const photoViews = Math.floor(Math.random() * 300) + 20;
        const visibilityScore = Number((Math.random() * 40 + 60).toFixed(1)); // 60-100 score

        try {
            // Upsert record
            await prisma.$executeRawUnsafe(
                `
        INSERT INTO "location_metrics" ("id", "locationId", "date", "impressionsTotal", "impressionsDiscovery", "impressionsDirect", "photoViews", "visibilityScore", "createdAt", "updatedAt")
        VALUES (gen_random_uuid(), $1::uuid, $2::date, $3, $4, $5, $6, $7, NOW(), NOW())
        ON CONFLICT ("locationId", "date")
        DO UPDATE SET
          "impressionsTotal" = $3,
          "impressionsDiscovery" = $4,
          "impressionsDirect" = $5,
          "photoViews" = $6,
          "visibilityScore" = $7,
          "updatedAt" = NOW()
        `,
                locationId,
                targetDate,
                impressionsTotal,
                impressionsDiscovery,
                impressionsDirect,
                photoViews,
                visibilityScore
            );

            // Log success job
            await prisma.$executeRawUnsafe(
                `
        INSERT INTO "metric_jobs" ("id", "locationId", "jobType", "status", "startedAt", "finishedAt")
        VALUES (gen_random_uuid(), $1::uuid, 'metrics_ingestion', 'success', NOW(), NOW())
        `,
                locationId
            );

            return { success: true, date: targetDate, data: { impressionsTotal, impressionsDiscovery, impressionsDirect, photoViews, visibilityScore } };
        } catch (error: any) {
            // Log failed job
            await prisma.$executeRawUnsafe(
                `
        INSERT INTO "metric_jobs" ("id", "locationId", "jobType", "status", "errorMessage", "startedAt", "finishedAt")
        VALUES (gen_random_uuid(), $1::uuid, 'metrics_ingestion', 'failed', $2, NOW(), NOW())
        `,
                locationId,
                error.message
            );
            throw error;
        }
    }

    /**
     * Backfill metrics for a date range
     */
    async backfillLocationMetrics(locationId: string, startDate: string, endDate: string) {
        const start = dayjs(startDate).startOf('day');
        const end = dayjs(endDate).startOf('day');

        if (!start.isValid() || !end.isValid()) {
            throw new Error('Invalid date range');
        }

        let current = start;
        let successCount = 0;
        const errors: string[] = [];

        // Create a running job
        const jobResult: any = await prisma.$queryRawUnsafe(
            `
      INSERT INTO "metric_jobs" ("id", "locationId", "jobType", "status", "startedAt")
      VALUES (gen_random_uuid(), $1::uuid, 'metrics_backfill', 'running', NOW())
      RETURNING id
      `,
            locationId
        );
        const jobId = jobResult[0]?.id;

        try {
            while (current.isBefore(end) || current.isSame(end, 'day')) {
                try {
                    await this.ingestLocationMetrics(locationId, current.toDate());
                    successCount++;
                } catch (e: any) {
                    errors.push(`Failed for ${current.format('YYYY-MM-DD')}: ${e.message}`);
                }
                current = current.add(1, 'day');
            }

            const status = errors.length > 0 ? (successCount > 0 ? 'partial' : 'failed') : 'success';
            const errorMessage = errors.length > 0 ? errors.join('; ') : null;

            if (jobId) {
                await prisma.$executeRawUnsafe(
                    `
          UPDATE "metric_jobs" 
          SET "status" = $1, "errorMessage" = $2, "finishedAt" = NOW()
          WHERE "id" = $3::uuid
          `,
                    status,
                    errorMessage,
                    jobId
                );
            }

            return { successCount, errors, status };
        } catch (e: any) {
            if (jobId) {
                await prisma.$executeRawUnsafe(
                    `
          UPDATE "metric_jobs" 
          SET "status" = 'failed', "errorMessage" = $1, "finishedAt" = NOW()
          WHERE "id" = $2::uuid
          `,
                    e.message,
                    jobId
                );
            }
            throw e;
        }
    }

    /**
     * Get aggregated metrics for a date range
     */
    async getLocationMetrics(locationId: string, startDate: string, endDate: string, granularity: 'daily' | 'weekly' = 'daily', compare: boolean = false) {
        const start = dayjs(startDate).startOf('day').toDate();
        const end = dayjs(endDate).endOf('day').toDate();

        // Fetch time series data for the main period
        const timeSeries = await prisma.$queryRawUnsafe<any[]>(
            `
      SELECT 
        "date", 
        "impressionsTotal", 
        "impressionsDiscovery", 
        "impressionsDirect", 
        "photoViews", 
        "visibilityScore"
      FROM "location_metrics"
      WHERE "locationId" = $1::uuid AND "date" >= $2::date AND "date" <= $3::date
      ORDER BY "date" ASC
      `,
            locationId,
            start,
            end
        );

        // Aggregate data function based on granularity
        const aggregateData = (data: any[], g: 'daily' | 'weekly') => {
            if (g === 'daily') {
                return data.map(d => ({
                    ...d,
                    date: dayjs(d.date).format('YYYY-MM-DD')
                }));
            } else {
                // Group by week start
                const grouped: Record<string, any> = {};
                data.forEach(d => {
                    const weekStart = dayjs(d.date).startOf('week').format('YYYY-MM-DD');
                    if (!grouped[weekStart]) {
                        grouped[weekStart] = {
                            date: weekStart,
                            impressionsTotal: 0,
                            impressionsDiscovery: 0,
                            impressionsDirect: 0,
                            photoViews: 0,
                            visibilityScoreSum: 0,
                            count: 0
                        };
                    }
                    grouped[weekStart].impressionsTotal += d.impressionsTotal;
                    grouped[weekStart].impressionsDiscovery += d.impressionsDiscovery;
                    grouped[weekStart].impressionsDirect += d.impressionsDirect;
                    grouped[weekStart].photoViews += d.photoViews;
                    if (d.visibilityScore !== null && d.visibilityScore !== undefined) {
                        grouped[weekStart].visibilityScoreSum += d.visibilityScore;
                        grouped[weekStart].count += 1;
                    }
                });

                return Object.values(grouped).map((week: any) => ({
                    date: week.date,
                    impressionsTotal: week.impressionsTotal,
                    impressionsDiscovery: week.impressionsDiscovery,
                    impressionsDirect: week.impressionsDirect,
                    photoViews: week.photoViews,
                    visibilityScore: week.count > 0 ? Number((week.visibilityScoreSum / week.count).toFixed(1)) : null
                })).sort((a, b) => a.date.localeCompare(b.date));
            }
        };

        const mainSeries = aggregateData(timeSeries, granularity);

        // Calculate totals for main period
        const mainTotals = mainSeries.reduce((acc, curr) => {
            acc.impressionsTotal += curr.impressionsTotal;
            acc.impressionsDiscovery += curr.impressionsDiscovery;
            acc.impressionsDirect += curr.impressionsDirect;
            acc.photoViews += curr.photoViews;
            if (curr.visibilityScore !== null) {
                acc.visibilityScoreSum += curr.visibilityScore;
                acc.count += 1;
            }
            return acc;
        }, {
            impressionsTotal: 0,
            impressionsDiscovery: 0,
            impressionsDirect: 0,
            photoViews: 0,
            visibilityScoreSum: 0,
            count: 0
        });

        const currentTotals = {
            impressionsTotal: mainTotals.impressionsTotal,
            impressionsDiscovery: mainTotals.impressionsDiscovery,
            impressionsDirect: mainTotals.impressionsDirect,
            photoViews: mainTotals.photoViews,
            visibilityScore: mainTotals.count > 0 ? Number((mainTotals.visibilityScoreSum / mainTotals.count).toFixed(1)) : null
        };

        let previousSeries = [];
        let previousTotals: any = null;
        let percentChanges: any = null;

        if (compare) {
            // Calculate previous period
            const diffDays = dayjs(end).diff(dayjs(start), 'day') + 1;
            const prevStart = dayjs(start).subtract(diffDays, 'day').toDate();
            const prevEnd = dayjs(end).subtract(diffDays, 'day').toDate();

            const prevTimeSeries = await prisma.$queryRawUnsafe<any[]>(
                `
        SELECT 
          "date", 
          "impressionsTotal", 
          "impressionsDiscovery", 
          "impressionsDirect", 
          "photoViews", 
          "visibilityScore"
        FROM "location_metrics"
        WHERE "locationId" = $1::uuid AND "date" >= $2::date AND "date" <= $3::date
        ORDER BY "date" ASC
        `,
                locationId,
                prevStart,
                prevEnd
            );

            previousSeries = aggregateData(prevTimeSeries, granularity);

            // Calculate totals for prev period
            const pTotals = previousSeries.reduce((acc, curr) => {
                acc.impressionsTotal += curr.impressionsTotal;
                acc.impressionsDiscovery += curr.impressionsDiscovery;
                acc.impressionsDirect += curr.impressionsDirect;
                acc.photoViews += curr.photoViews;
                if (curr.visibilityScore !== null) {
                    acc.visibilityScoreSum += curr.visibilityScore;
                    acc.count += 1;
                }
                return acc;
            }, {
                impressionsTotal: 0,
                impressionsDiscovery: 0,
                impressionsDirect: 0,
                photoViews: 0,
                visibilityScoreSum: 0,
                count: 0
            });

            previousTotals = {
                impressionsTotal: pTotals.impressionsTotal,
                impressionsDiscovery: pTotals.impressionsDiscovery,
                impressionsDirect: pTotals.impressionsDirect,
                photoViews: pTotals.photoViews,
                visibilityScore: pTotals.count > 0 ? Number((pTotals.visibilityScoreSum / pTotals.count).toFixed(1)) : null
            };

            // Calculate percent changes
            const calcPercentChange = (current: number | null, prev: number | null) => {
                if (current === null || prev === null) return null;
                if (prev === 0) return current > 0 ? 100 : 0;
                return Number((((current - prev) / prev) * 100).toFixed(1));
            };

            percentChanges = {
                impressionsTotal: calcPercentChange(currentTotals.impressionsTotal, previousTotals.impressionsTotal),
                impressionsDiscovery: calcPercentChange(currentTotals.impressionsDiscovery, previousTotals.impressionsDiscovery),
                impressionsDirect: calcPercentChange(currentTotals.impressionsDirect, previousTotals.impressionsDirect),
                photoViews: calcPercentChange(currentTotals.photoViews, previousTotals.photoViews),
                visibilityScore: calcPercentChange(currentTotals.visibilityScore, previousTotals.visibilityScore)
            };
        }

        return {
            current: {
                totals: currentTotals,
                series: mainSeries
            },
            compare: compare ? {
                totals: previousTotals,
                series: previousSeries,
                percentChanges
            } : null
        };
    }

    async getLatestJobStatus(locationId: string) {
        const jobs = await prisma.$queryRawUnsafe<any[]>(
            `
      SELECT *
      FROM "metric_jobs"
      WHERE "locationId" = $1::uuid
      ORDER BY "startedAt" DESC
      LIMIT 1
      `,
            locationId
        );
        return jobs[0] || null;
    }
}

export const gbpMetricsService = new GbpMetricsService();
