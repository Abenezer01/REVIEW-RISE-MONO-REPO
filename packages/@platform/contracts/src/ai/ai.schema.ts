import { z } from 'zod';

export const ClassifyCompetitorRequestSchema = z.object({
  domain: z.string(),
  title: z.string().optional(),
  snippet: z.string().optional(),
  businessContext: z.any().optional(),
});

export const AnalyzeCompetitorRequestSchema = z.object({
  domain: z.string(),
  headline: z.string().optional(),
  uvp: z.string().optional(),
  serviceList: z.array(z.string()).optional(),
  businessContext: z.any().optional(),
});

export const GenerateReportRequestSchema = z.object({
  competitors: z.array(z.any()),
  businessType: z.string(),
});

export const GenerateReviewRepliesRequestSchema = z.object({
  reviewId: z.string(),
  options: z.any().optional(),
});

export const GenerateRecommendationsRequestSchema = z.object({
  category: z.string(),
  context: z.any(),
});

export const GenerateVisibilityPlanRequestSchema = z.object({
  context: z.any(),
});

export const AnalyzeReviewRequestSchema = z.object({
  content: z.string().optional(),
  rating: z.number(),
});
