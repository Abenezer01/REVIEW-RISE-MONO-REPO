import { z } from 'zod';

// ============================================================================
// Brand Profile Schemas
// ============================================================================

export const OnboardBrandProfileRequestSchema = z.object({
  websiteUrl: z.string().url(),
  businessId: z.string().uuid(),
});

export type OnboardBrandProfileRequest = z.infer<typeof OnboardBrandProfileRequestSchema>;

export const UpdateBrandProfileRequestSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  status: z.string().optional(),
  websiteUrl: z.string().url().optional(),
  tone: z.any().optional(),
  autoReplySettings: z.any().optional(),
});

export type UpdateBrandProfileRequest = z.infer<typeof UpdateBrandProfileRequestSchema>;

export const GenerateBrandToneRequestSchema = z.object({
  industry: z.string().optional(),
  location: z.string().optional(),
});

export type GenerateBrandToneRequest = z.infer<typeof GenerateBrandToneRequestSchema>;

export const BrandProfileQuerySchema = z.object({
  page: z.string().optional().transform(val => val ? parseInt(val, 10) : undefined),
  limit: z.string().optional().transform(val => val ? parseInt(val, 10) : undefined),
  search: z.string().optional(),
  businessId: z.string().uuid().optional(),
  status: z.string().optional(),
});

export type BrandProfileQuery = z.infer<typeof BrandProfileQuerySchema>;
