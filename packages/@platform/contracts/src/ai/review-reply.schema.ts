import { z } from 'zod';

/**
 * Review Reply Variations Schema
 * Defines the structure for AI-generated review reply suggestions
 */
export const ReviewReplyVariationsSchema = z.object({
    variations: z.array(z.string().min(10).max(1000)).min(1).max(5),
});

export type ReviewReplyVariations = z.infer<typeof ReviewReplyVariationsSchema>;
