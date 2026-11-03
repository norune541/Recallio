import { Injectable } from '@nestjs/common';
import { InternalServerErrorException } from '@nestjs/common';
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
      system: ANALYZE_PRODUCT_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: JSON.stringify(message) }],
      model: 'claude-haiku-4-5',
      output_config: {
        format: zodOutputFormat(ProductAIReviewSchema),
      },
    });

    if (!response.parsed_output) {
      throw new InternalServerErrorException(
        'Anthropic returned a response without a text block',
      );
    }

    return response.parsed_output;
  }
}
