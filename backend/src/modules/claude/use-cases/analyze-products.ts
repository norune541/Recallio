import { Injectable } from '@nestjs/common';

import { ClaudeMessageProvider } from '../claudeMessageAdapter.js';
import type { ShopifyProductNode } from 'backend/src/common/types/products.js';

@Injectable()
export class AnalyzeProductUseCase {
  constructor(private readonly anthropic: ClaudeMessageProvider) {}

  async execute(page: ShopifyProductNode) {
    return await this.anthropic.analyzeProduct(page);
  }
}
