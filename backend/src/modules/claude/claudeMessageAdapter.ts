import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod';

import { ClaudeClientProvider } from './claudeClientProvider.js';
import { ProductAIReviewSchema } from './dto/product-review.js';
import { ANALYZE_PRODUCT_SYSTEM_PROMPT } from './prompts/analyze-product.js';
import type { ProductAIReview } from './dto/product-review.js';
import type { ShopifyProductNode } from 'backend/src/common/types/products.js';

@Injectable()
export class ClaudeMessageAdapter {
  constructor(private readonly anthropic: ClaudeClientProvider) {}
  async analyzeProduct(message: ShopifyProductNode): Promise<ProductAIReview> {
    const response = await this.anthropic.client.messages.parse({
      max_tokens: 2048,
      model: 'claude-haiku-5-5',
      system: [
        {
          type: 'text',
          text: ANALYZE_PRODUCT_SYSTEM_PROMPT,
          cache_control: {
            type: 'ephemeral',
          },
        },
      ],
      messages: [
        {
          role: 'user',
          content: JSON.stringify(message),
        },
      ],
      output_config: {
        format: zodOutputFormat(ProductAIReviewSchema),
      },
    });
    if (!response.parsed_output) {
      throw new InternalServerErrorException(
        'Anthropic returned a response without a parsed output',
      );
    }

    return response.parsed_output;
  }

  async analyzeProducts(
    products: ShopifyProductNode[],
  ): Promise<ProductAIReview> {
    const productsToAnalyze = products.slice(0, 3);

    const reviews = await Promise.all(
      productsToAnalyze.map((product) => this.analyzeProduct(product)),
    );

    const priority = { high: 3, medium: 2, low: 1 };

    const sortedReviews = reviews
      .map((review, index) => ({ review, index }))
      .sort((a, b) => {
        const aPriority = Math.max(
          0,
          ...a.review.insights.map((i) => priority[i.priority]),
        );

        const bPriority = Math.max(
          0,
          ...b.review.insights.map((i) => priority[i.priority]),
        );

        return bPriority - aPriority;
      });

    const selectedReview = sortedReviews[0]?.review;

    return {
      seo: selectedReview?.seo ?? {
        title: '',
        metaDescription: '',
      },
      insights: sortedReviews
        .flatMap(({ review }) => review.insights)
        .sort((a, b) => priority[b.priority] - priority[a.priority])
        .slice(0, 3),
    };
  }
}
