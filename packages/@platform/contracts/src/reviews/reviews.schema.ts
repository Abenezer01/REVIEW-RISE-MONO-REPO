import { z } from 'zod';

export const ListReviewsQuerySchema = z.object({
  page: z.string().optional().transform(v => v ? parseInt(v) : 1),
  limit: z.string().optional().transform(v => v ? parseInt(v) : 10),
  search: z.string().optional(),
  rating: z.string().optional().transform(v => v ? parseInt(v) : undefined),
  status: z.enum(['pending', 'replied', 'rejected']).optional(),
  source: z.string().optional(),
  businessId: z.string().optional(),
});

export const PostReplyRequestSchema = z.object({
  replyText: z.string().min(1),
});

export const AnalyticsQuerySchema = z.object({
  businessId: z.string().uuid(),
  locationId: z.string().uuid().optional(),
  period: z.string().optional().default('30'),
  groupBy: z.enum(['day', 'week']).optional().default('day'),
  limit: z.string().optional().default('10'),
});

export const AddCompetitorDataSchema = z.object({
  businessId: z.string().uuid(),
  locationId: z.string().uuid().optional(),
  competitorName: z.string().min(1),
  averageRating: z.number().min(0).max(5),
  totalReviews: z.number().int().min(0),
  source: z.string().optional().default('manual'),
});
