import { z } from 'zod';

export const ProductAIReviewSchema = z.object({
  seo: z.object({
    title: z.string(),
    metaDescription: z.string(),
  }),

  insights: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
      category: z.enum(['content', 'inventory', 'seo', 'pricing', 'product']),
      priority: z.enum(['low', 'medium', 'high']),
    }),
  ),
});

export type ProductAIReview = z.infer<typeof ProductAIReviewSchema>;
