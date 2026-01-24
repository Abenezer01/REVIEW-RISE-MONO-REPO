import { prisma } from '@platform/db';
import * as ScheduledPostService from './scheduled-posts.service';

const POLL_INTERVAL = 60 * 1000; // Check every minute

export class PublishingWorker {
  private interval: NodeJS.Timeout | null = null;

  start() {
    if (this.interval) return;

    console.log('Starting Publishing Worker...');
    this.interval = setInterval(() => this.tick(), POLL_INTERVAL);
    
    // Run immediately on start
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

      // 1. Find pending jobs that are due
      const pendingJobs = await prisma.publishingJob.findMany({
        where: {
          status: 'pending',
          scheduledPost: {
            scheduledAt: {
              lte: now,
            },
            status: {
              in: ['scheduled', 'publishing'],
            },
          },
        },
        select: { id: true },
        take: 10,
      });

      // 2. Find failed jobs that are eligible for retry (exponential backoff)
      // We'll fetch a few and filter in memory to keep it simple, or use a complex Prisma query
      const potentiallyRetryableJobs = await prisma.publishingJob.findMany({
        where: {
          status: 'failed',
          attemptCount: {
            lt: ScheduledPostService.MAX_RETRIES,
          },
          scheduledPost: {
            status: {
              in: ['scheduled', 'publishing', 'failed'],
            },
          },
        },
        include: {
          scheduledPost: true,
        },
        take: 10,
      });

      const retryableJobs = potentiallyRetryableJobs.filter(job => {
        if (!job.lastAttemptAt) return true;
        
        // Exponential backoff: base * 2^(attempts-1)
        // 1st retry: 5m * 2^0 = 5m
        // 2nd retry: 5m * 2^1 = 10m
        // 3rd retry: 5m * 2^2 = 20m
        const backoffMs = ScheduledPostService.RETRY_DELAY_BASE * Math.pow(2, job.attemptCount - 1);
        const nextRetryAt = new Date(job.lastAttemptAt.getTime() + backoffMs);
        
        return nextRetryAt <= now;
      });

      const allJobsToProcess = [...pendingJobs.map(j => j.id), ...retryableJobs.map(j => j.id)];

      if (allJobsToProcess.length > 0) {
        console.log(`Publishing Worker: Processing ${allJobsToProcess.length} jobs (${pendingJobs.length} new, ${retryableJobs.length} retries)`);
        
        for (const jobId of allJobsToProcess) {
          await ScheduledPostService.processJob(jobId);
        }
      }
    } catch (error) {
      console.error('Publishing Worker Error:', error);
    }
  }
}

export const publishingWorker = new PublishingWorker();
