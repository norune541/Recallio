import { z } from 'zod';

export const getProductsSchema = z.object({
  limit: z.coerce.number().int().positive().max(100).default(1),
  after: z.string().trim().min(1).optional(),
});

export type getProductsType = z.infer<typeof getProductsSchema>;
