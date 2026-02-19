import { Request, Response } from 'express';
import { z } from 'zod';
import { createSuccessResponse, createErrorResponse, SystemMessageCode } from '@platform/contracts';
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
      // eslint-disable-next-line no-console
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
  try {
    const businessId = req.params.id;
    const locationId = req.query.locationId as string;
    const posts = await ScheduledPostService.listPosts(businessId, locationId);
    const formattedPosts = posts.map(formatPostResponse);
    const response = createSuccessResponse(formattedPosts, 'Scheduled posts fetched', 200, { requestId: req.id }, SystemMessageCode.SUCCESS);
    res.status(response.statusCode).json(response);
  } catch (e: any) {
    const response = createErrorResponse(e.message, SystemMessageCode.INTERNAL_SERVER_ERROR, 500, undefined, req.id);
    res.status(response.statusCode).json(response);
  }
};

export const get = async (req: Request, res: Response) => {
  try {
    const businessId = req.params.id;
    const postId = req.params.postId;
    const post = await ScheduledPostService.getPost(postId, businessId);
    if (!post) {
      const errorResponse = createErrorResponse('Post not found', SystemMessageCode.POST_NOT_FOUND, 404, undefined, req.id);
      return res.status(errorResponse.statusCode).json(errorResponse);
    }
    const response = createSuccessResponse(formatPostResponse(post), 'Scheduled post fetched', 200, { requestId: req.id }, SystemMessageCode.SUCCESS);
    res.status(response.statusCode).json(response);
  } catch (e: any) {
    const response = createErrorResponse(e.message, SystemMessageCode.INTERNAL_SERVER_ERROR, 500, undefined, req.id);
    res.status(response.statusCode).json(response);
  }
};

export const create = async (req: Request, res: Response) => {
  try {
    const businessId = req.params.id;
    const validation = scheduledPostSchema.safeParse(req.body);
    if (!validation.success) {
      const errorResponse = createErrorResponse('Invalid inputs', SystemMessageCode.VALIDATION_ERROR, 400, undefined, req.id);
      return res.status(errorResponse.statusCode).json(errorResponse);
    }

    const result = await ScheduledPostService.createPost(businessId, validation.data);
    const response = createSuccessResponse(formatPostResponse(result), 'Scheduled post created', 201, { requestId: req.id }, SystemMessageCode.POST_CREATED);
    res.status(response.statusCode).json(response);
  } catch (e: any) {
    const response = createErrorResponse(e.message, SystemMessageCode.INTERNAL_SERVER_ERROR, 500, undefined, req.id);
    res.status(response.statusCode).json(response);
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const businessId = req.params.id;
    const postId = req.params.postId;
    const validation = scheduledPostSchema.partial().safeParse(req.body);

    if (!validation.success) {
      const errorResponse = createErrorResponse('Invalid inputs', SystemMessageCode.VALIDATION_ERROR, 400, undefined, req.id);
      return res.status(errorResponse.statusCode).json(errorResponse);
    }

    const result = await ScheduledPostService.updatePost(postId, businessId, validation.data);
    const response = createSuccessResponse(formatPostResponse(result), 'Scheduled post updated', 200, { requestId: req.id }, SystemMessageCode.POST_UPDATED);
    res.status(response.statusCode).json(response);
  } catch (e: any) {
    const response = createErrorResponse(e.message, SystemMessageCode.INTERNAL_SERVER_ERROR, 500, undefined, req.id);
    res.status(response.statusCode).json(response);
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    const businessId = req.params.id;
    const postId = req.params.postId;
    await ScheduledPostService.deletePost(postId, businessId);
    const response = createSuccessResponse(null, 'Scheduled post deleted', 200, { requestId: req.id }, SystemMessageCode.POST_DELETED);
    res.status(response.statusCode).json(response);
  } catch (e: any) {
    const response = createErrorResponse(e.message, SystemMessageCode.INTERNAL_SERVER_ERROR, 500, undefined, req.id);
    res.status(response.statusCode).json(response);
  }
};

export const duplicate = async (req: Request, res: Response) => {
  try {
    const businessId = req.params.id;
    const postId = req.params.postId;
    const { scheduledAt, status } = req.body;

    const result = await ScheduledPostService.duplicatePost(postId, businessId, { scheduledAt, status });
    const response = createSuccessResponse(formatPostResponse(result), 'Scheduled post duplicated', 201, { requestId: req.id }, SystemMessageCode.POST_DUPLICATED);
    res.status(response.statusCode).json(response);
  } catch (e: any) {
    const response = createErrorResponse(e.message, SystemMessageCode.INTERNAL_SERVER_ERROR, 500, undefined, req.id);
    res.status(response.statusCode).json(response);
  }
};

export const getLogs = async (req: Request, res: Response) => {
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

    const formattedLogs = logs.map((log: any) => ({
      ...log,
      scheduledPost: formatPostResponse(log.scheduledPost),
    }));

    const response = createSuccessResponse(formattedLogs, 'Publishing logs fetched', 200, { requestId: req.id }, SystemMessageCode.SUCCESS);
    res.status(response.statusCode).json(response);
  } catch (e: any) {
    const response = createErrorResponse(e.message, SystemMessageCode.INTERNAL_SERVER_ERROR, 500, undefined, req.id);
    res.status(response.statusCode).json(response);
  }
};
