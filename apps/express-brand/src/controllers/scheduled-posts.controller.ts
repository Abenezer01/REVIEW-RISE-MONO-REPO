import { Request, Response } from 'express';
import { z } from 'zod';
import crypto from 'crypto';
import { createSuccessResponse, createErrorResponse, ErrorCode } from '@platform/contracts';
import * as ScheduledPostService from '../services/scheduled-posts.service';

const scheduledPostSchema = z.object({
  platforms: z.array(z.string()),
  content: z.object({
    title: z.string().optional(),
    text: z.string(),
    hashtags: z.string().optional(),
    media: z.array(z.any()).optional(),
  }),
  scheduledAt: z.string(),
  timezone: z.string().optional(),
  status: z.enum(['draft', 'scheduled', 'published', 'failed', 'cancelled']).optional(),
  locationId: z.string().uuid().nullable().optional(),
});

const formatPostResponse = (post: any) => {
  if (!post) return null;
  
  let content = post.content;
  if (typeof content === 'string') {
    try {
      content = JSON.parse(content);
    } catch (e) {
      console.error('Failed to parse post content:', e);
    }
  }

  // Combine content and media back together for the frontend
  const formattedContent = {
    ...content,
    media: post.media || content.media || [],
  };

  return {
    ...post,
    content: formattedContent,
  };
};

export const list = async (req: Request, res: Response) => {
  const requestId = (req as any).id || crypto.randomUUID();
  try {
    const businessId = req.params.id;
    const locationId = req.query.locationId as string;
    const posts = await ScheduledPostService.listPosts(businessId, locationId);
    const formattedPosts = posts.map(formatPostResponse);
    res.json(createSuccessResponse(formattedPosts, 'Scheduled posts fetched', 200, { requestId }));
  } catch (e: any) {
    res.status(500).json(createErrorResponse(e.message, ErrorCode.INTERNAL_SERVER_ERROR, 500, undefined, requestId));
  }
};

export const get = async (req: Request, res: Response) => {
  const requestId = (req as any).id || crypto.randomUUID();
  console.log(`[ScheduledPostsController] get post: ${req.params.postId} for business ${req.params.id}`);
  try {
    const businessId = req.params.id;
    const postId = req.params.postId;
    const post = await ScheduledPostService.getPost(postId, businessId);
    if (!post) {
      return res.status(404).json(createErrorResponse('Post not found', ErrorCode.NOT_FOUND, 404, undefined, requestId));
    }
    res.json(createSuccessResponse(formatPostResponse(post), 'Scheduled post fetched', 200, { requestId }));
  } catch (e: any) {
    res.status(500).json(createErrorResponse(e.message, ErrorCode.INTERNAL_SERVER_ERROR, 500, undefined, requestId));
  }
};

export const create = async (req: Request, res: Response) => {
  const requestId = (req as any).id || crypto.randomUUID();
  try {
    const businessId = req.params.id;
    const validation = scheduledPostSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json(createErrorResponse('Invalid inputs', ErrorCode.VALIDATION_ERROR, 400, undefined, requestId));
    }

    const result = await ScheduledPostService.createPost(businessId, validation.data);
    res.json(createSuccessResponse(formatPostResponse(result), 'Scheduled post created', 201, { requestId }));
  } catch (e: any) {
    res.status(500).json(createErrorResponse(e.message, ErrorCode.INTERNAL_SERVER_ERROR, 500, undefined, requestId));
  }
};

export const update = async (req: Request, res: Response) => {
  const requestId = (req as any).id || crypto.randomUUID();
  try {
    const businessId = req.params.id;
    const postId = req.params.postId;
    const validation = scheduledPostSchema.partial().safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json(createErrorResponse('Invalid inputs', ErrorCode.VALIDATION_ERROR, 400, undefined, requestId));
    }

    const result = await ScheduledPostService.updatePost(postId, businessId, validation.data);
    res.json(createSuccessResponse(formatPostResponse(result), 'Scheduled post updated', 200, { requestId }));
  } catch (e: any) {
    res.status(500).json(createErrorResponse(e.message, ErrorCode.INTERNAL_SERVER_ERROR, 500, undefined, requestId));
  }
};

export const remove = async (req: Request, res: Response) => {
  const requestId = (req as any).id || crypto.randomUUID();
  try {
    const businessId = req.params.id;
    const postId = req.params.postId;
    await ScheduledPostService.deletePost(postId, businessId);
    res.json(createSuccessResponse(null, 'Scheduled post deleted', 200, { requestId }));
  } catch (e: any) {
    res.status(500).json(createErrorResponse(e.message, ErrorCode.INTERNAL_SERVER_ERROR, 500, undefined, requestId));
  }
};

export const duplicate = async (req: Request, res: Response) => {
  const requestId = (req as any).id || crypto.randomUUID();
  try {
    const businessId = req.params.id;
    const postId = req.params.postId;
    const { scheduledAt, status } = req.body;

    const result = await ScheduledPostService.duplicatePost(postId, businessId, { scheduledAt, status });
    res.json(createSuccessResponse(formatPostResponse(result), 'Scheduled post duplicated', 201, { requestId }));
  } catch (e: any) {
    res.status(500).json(createErrorResponse(e.message, ErrorCode.INTERNAL_SERVER_ERROR, 500, undefined, requestId));
  }
};

export const getLogs = async (req: Request, res: Response) => {
  const requestId = (req as any).id || crypto.randomUUID();
  try {
    const businessId = req.params.id;
    const { startDate, endDate, platform, status, locationId } = req.query;

    const logs = await ScheduledPostService.listPublishingLogs(businessId, {
      startDate: startDate as string,
      endDate: endDate as string,
      platform: platform as string,
      status: status as string,
      locationId: locationId as string,
    });

    const formattedLogs = logs.map(log => ({
      ...log,
      scheduledPost: formatPostResponse(log.scheduledPost),
    }));

    res.json(createSuccessResponse(formattedLogs, 'Publishing logs fetched', 200, { requestId }));
  } catch (e: any) {
    res.status(500).json(createErrorResponse(e.message, ErrorCode.INTERNAL_SERVER_ERROR, 500, undefined, requestId));
  }
};
