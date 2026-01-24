import { prisma } from '@platform/db';
import axios from 'axios';

// We'll call express-social for publishing
const SOCIAL_SERVICE_URL = process.env.SOCIAL_SERVICE_URL || 'http://localhost:3003';

export const listPosts = async (businessId: string, locationId?: string) => {
  return prisma.scheduledPost.findMany({
    where: { 
      businessId,
      locationId: locationId || undefined,
    },
    orderBy: { scheduledAt: 'asc' },
    include: {
      publishingJobs: true,
    },
  });
};

export const getPost = async (id: string, businessId: string) => {
  return prisma.scheduledPost.findFirst({
    where: { id, businessId },
    include: {
      publishingJobs: true,
    },
  });
};

export const createPost = async (businessId: string, data: any) => {
  const { platforms, content, scheduledAt, timezone, status, locationId } = data;
  const { media, ...otherContent } = content;

  return prisma.$transaction(async (tx) => {
    // 1. Create ScheduledPost
    const post = await tx.scheduledPost.create({
      data: {
        businessId,
        locationId: locationId || null,
        platforms,
        content: JSON.stringify(otherContent),
        media: media ? media : undefined,
        scheduledAt: new Date(scheduledAt),
        timezone: timezone || 'UTC',
        status: status || 'draft',
      },
    });

    // 2. If status is 'scheduled', create PublishingJob entries for each platform
    if (status === 'scheduled' || status === 'publishing') {
      const jobs = platforms.map((platform: string) => ({
        scheduledPostId: post.id,
        platform,
        status: 'pending',
      }));

      await tx.publishingJob.createMany({
        data: jobs,
      });
    }

    return post;
  });
};

export const updatePost = async (id: string, businessId: string, data: any) => {
  const { platforms, content, scheduledAt, timezone, status, locationId } = data;
  const { media, ...otherContent } = content || {};

  return prisma.$transaction(async (tx) => {
    // 1. Update ScheduledPost
    const post = await tx.scheduledPost.update({
      where: { id, businessId },
      data: {
        locationId: locationId !== undefined ? (locationId || null) : undefined,
        platforms,
        content: content ? JSON.stringify(otherContent) : undefined,
        media: media !== undefined ? (media || null) : undefined,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
        timezone,
        status,
      },
    });

    // 2. Sync PublishingJobs if status changed to 'scheduled' or platforms changed
    if (status === 'scheduled' || platforms) {
      const existingJobs = await tx.publishingJob.findMany({
        where: { scheduledPostId: id },
      });

      const existingPlatforms = existingJobs.map(j => j.platform);
      const newPlatforms = platforms || post.platforms;

      // Platforms to add
      const platformsToAdd = newPlatforms.filter((p: string) => !existingPlatforms.includes(p));
      if (platformsToAdd.length > 0) {
        await tx.publishingJob.createMany({
          data: platformsToAdd.map((platform: string) => ({
            scheduledPostId: id,
            platform,
            status: 'pending',
          })),
        });
      }

      // Platforms to remove (only if they are still pending)
      const platformsToRemove = existingPlatforms.filter(p => !newPlatforms.includes(p));
      if (platformsToRemove.length > 0) {
        await tx.publishingJob.deleteMany({
          where: {
            scheduledPostId: id,
            platform: { in: platformsToRemove },
            status: 'pending',
          },
        });
      }
    }

    return post;
  });
};

export const deletePost = async (id: string, businessId: string) => {
  return prisma.scheduledPost.delete({
    where: { id, businessId },
  });
};

export const duplicatePost = async (id: string, businessId: string, data?: { scheduledAt?: string; status?: string }) => {
  const originalPost = await prisma.scheduledPost.findFirst({
    where: { id, businessId },
  });

  if (!originalPost) {
    throw new Error('Post not found');
  }

  // We need to parse content if it's stored as a stringified JSON in DB
  let content: any = originalPost.content;
  try {
    if (typeof content === 'string') {
      content = JSON.parse(content);
    }
  } catch (e) {
    console.error('Failed to parse post content during duplication:', e);
    content = {};
  }

  return createPost(businessId, {
    platforms: originalPost.platforms,
    content: {
      ...content,
      media: originalPost.media,
    },
    scheduledAt: data?.scheduledAt || originalPost.scheduledAt.toISOString(),
    status: data?.status || 'draft',
    locationId: originalPost.locationId,
    timezone: originalPost.timezone,
  });
};

export const listPublishingLogs = async (
  businessId: string,
  filters: {
    startDate?: string;
    endDate?: string;
    platform?: string;
    status?: string;
    locationId?: string;
  }
) => {
  const { startDate, endDate, platform, status, locationId } = filters;

  const where: any = {
    scheduledPost: {
      businessId,
      locationId: locationId || undefined,
    },
  };

  if (platform && platform !== 'ALL') {
    where.platform = platform.toLowerCase();
  }

  if (status && status !== 'ALL') {
    where.status = status.toLowerCase();
  }

  if (startDate || endDate) {
    where.updatedAt = {};
    if (startDate) where.updatedAt.gte = new Date(startDate);
    if (endDate) where.updatedAt.lte = new Date(endDate);
  }

  return prisma.publishingJob.findMany({
    where,
    include: {
      scheduledPost: true,
    },
    orderBy: { updatedAt: 'desc' },
  });
};

export const MAX_RETRIES = 3;
export const RETRY_DELAY_BASE = 5 * 60 * 1000; // 5 minutes

export const processJob = async (jobId: string) => {
  const job = await prisma.publishingJob.findUnique({
    where: { id: jobId },
    include: {
      scheduledPost: {
        include: {
          business: true,
        },
      },
    },
  });

  if (!job || (job.status !== 'pending' && job.status !== 'failed')) return;
  if (job.status === 'failed' && job.attemptCount >= MAX_RETRIES) return;

  await prisma.publishingJob.update({
    where: { id: jobId },
    data: { 
      status: 'processing', 
      lastAttemptAt: new Date(), 
      attemptCount: { increment: 1 } 
    },
  });

  try {
    const post = job.scheduledPost;
    const content = typeof post.content === 'string' ? JSON.parse(post.content) : post.content;

    // Fetch social connection for this platform
    const connection = await prisma.socialConnection.findFirst({
      where: {
        businessId: post.businessId,
        locationId: post.locationId,
        platform: job.platform.toLowerCase(),
        status: 'active',
      },
    });

    if (!connection) {
      throw new Error(`No active social connection found for ${job.platform}`);
    }

    // Call express-social to publish
    const response = await axios.post(`${SOCIAL_SERVICE_URL}/v1/social/publish`, {
      platform: job.platform,
      connectionId: connection.id,
      content: {
        text: content.text,
        media: post.media,
      },
    });

    await prisma.publishingJob.update({
      where: { id: jobId },
      data: {
        status: 'completed',
        externalId: response.data.data?.id || response.data.data?.externalId,
        error: null,
      },
    });

    // Check if all jobs for this post are completed
    const allJobs = await prisma.publishingJob.findMany({
      where: { scheduledPostId: post.id },
    });

    const allCompleted = allJobs.every(j => j.status === 'completed');
    const anyFailedPermanently = allJobs.some(j => j.status === 'failed' && j.attemptCount >= MAX_RETRIES);

    if (allCompleted) {
      await prisma.scheduledPost.update({
        where: { id: post.id },
        data: { status: 'published' },
      });
    } else if (anyFailedPermanently) {
      await prisma.scheduledPost.update({
        where: { id: post.id },
        data: { status: 'failed' },
      });
    }
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message;
    console.error(`Failed to process job ${jobId}:`, errorMessage);

    const isLastAttempt = job.attemptCount + 1 >= MAX_RETRIES;

    await prisma.publishingJob.update({
      where: { id: jobId },
      data: {
        status: 'failed',
        error: errorMessage,
      },
    });

    if (isLastAttempt) {
      await prisma.scheduledPost.update({
        where: { id: job.scheduledPostId },
        data: { status: 'failed' },
      });
    }
  }
};

