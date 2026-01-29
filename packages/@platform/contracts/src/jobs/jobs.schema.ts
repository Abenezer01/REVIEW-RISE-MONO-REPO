import { z } from 'zod';

export const TriggerJobSchema = z.object({
  jobId: z.string().uuid().optional(),
  businessId: z.string().uuid().optional(),
  reprocess: z.boolean().optional(),
  batchSize: z.number().int().positive().optional(),
});
