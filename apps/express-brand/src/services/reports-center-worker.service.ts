import { prisma } from '@platform/db';
import * as ReportsCenterService from './reports-center.service';

const POLL_INTERVAL = 60 * 1000;

export class ReportsCenterWorker {
  private interval: NodeJS.Timeout | null = null;

  start() {
    if (this.interval) return;
    // eslint-disable-next-line no-console
    console.log('Starting Reports Center Worker...');
    this.interval = setInterval(() => this.tick(), POLL_INTERVAL);
    this.tick();
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  private async tick() {
    try {
      const now = new Date();

      const dueSchedules = await prisma.reportsCenterSchedule.findMany({
        where: {
          status: 'active',
          nextRunAt: { lte: now },
          triggerEnabled: false
        },
        take: 10
      });

      for (const schedule of dueSchedules) {
        await ReportsCenterService.generateReportRun(schedule.businessId);
        await prisma.reportsCenterSchedule.update({
          where: { id: schedule.id },
          data: {
            lastRunAt: now,
            nextRunAt: ReportsCenterService.computeNextRun(now, schedule.frequency as any)
          }
        });
      }

      const pendingExports = await prisma.reportsCenterExportJob.findMany({
        where: {
          status: 'Processing',
          createdAt: { lte: new Date(now.getTime() - 30_000) }
        },
        take: 10
      });

      for (const job of pendingExports) {
        await prisma.reportsCenterExportJob.update({
          where: { id: job.id },
          data: {
            status: 'Ready',
            completedAt: now,
            resultUrl: `/api/brands/${job.businessId}/reports-center/exports/${job.id}/download?format=csv`
          }
        });
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Reports Center Worker Error:', error);
    }
  }
}

export const reportsCenterWorker = new ReportsCenterWorker();
