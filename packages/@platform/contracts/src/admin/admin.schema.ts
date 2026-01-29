import { z } from 'zod';

export const AdminLocationCreateSchema = z.object({
  name: z.string().min(1),
  address: z.string().optional(),
  timezone: z.string().optional(),
  tags: z.array(z.string()).optional(),
  businessId: z.string().uuid(),
  platformIds: z.record(z.string(), z.any()).optional(),
  status: z.string().optional(),
});

export const AdminLocationUpdateSchema = AdminLocationCreateSchema.partial();

export const AdminBusinessQuerySchema = z.object({
  search: z.string().optional(),
  page: z.string().optional().transform(val => val ? parseInt(val) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val) : 20),
});

export const AdminLocationQuerySchema = z.object({
  page: z.string().optional().transform(val => val ? parseInt(val) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val) : 10),
  search: z.string().optional(),
  businessId: z.string().uuid().optional(),
  'include[business]': z.string().optional(),
});
