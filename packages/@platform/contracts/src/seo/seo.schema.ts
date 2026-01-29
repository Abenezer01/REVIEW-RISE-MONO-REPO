import { z } from 'zod';

export const SEOAnalysisRequestSchema = z.object({
  url: z.string().url(),
  businessId: z.string().uuid(),
  locationId: z.string().uuid().optional(),
});

export const VisibilityQuerySchema = z.object({
  businessId: z.string().uuid(),
  locationId: z.string().uuid().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  periodType: z.string().optional(),
  limit: z.string().optional().transform(v => v ? parseInt(v) : 30),
  offset: z.string().optional().transform(v => v ? parseInt(v) : 0),
});

export const HeatmapQuerySchema = z.object({
  businessId: z.string().uuid(),
  locationId: z.string().uuid().optional(),
  keywordId: z.string().uuid().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  metric: z.enum(['rank', 'visibility']).optional().default('rank'),
});

export const ComputeMetricsRequestSchema = z.object({
  businessId: z.string().uuid(),
  locationId: z.string().uuid().optional(),
  periodType: z.string(),
  periodStart: z.string(),
  periodEnd: z.string(),
});

export const AIVisibilityAnalyzeSchema = z.object({
  businessId: z.string().uuid(),
  locationId: z.string().uuid().optional(),
  urls: z.array(z.string().url()).optional(),
});

export const AIVisibilityValidateSchema = z.object({
  businessId: z.string().uuid(),
  locationId: z.string().uuid().optional(),
  analysisId: z.string().uuid(),
});

export const CreateKeywordSchema = z.object({
  businessId: z.string().uuid(),
  locationId: z.string().uuid().optional(),
  keyword: z.string().min(1),
  tags: z.array(z.string()).optional(),
});

export const BulkCreateKeywordsSchema = z.object({
  businessId: z.string().uuid(),
  locationId: z.string().uuid().optional(),
  keywords: z.array(z.string().min(1)),
  tags: z.array(z.string()).optional(),
});

export const KeywordQuerySchema = z.object({
  businessId: z.string().uuid(),
  locationId: z.string().uuid().optional(),
  limit: z.string().optional().transform(v => v ? parseInt(v) : 50),
  offset: z.string().optional().transform(v => v ? parseInt(v) : 0),
});

export const IngestRankSchema = z.object({
  keywordId: z.string().uuid(),
  rankPosition: z.number().int(),
  capturedAt: z.string().optional(),
  source: z.string().optional(),
});
