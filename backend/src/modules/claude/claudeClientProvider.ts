import { Injectable } from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';

import { env } from 'backend/src/config/env.js';

@Injectable()
export class ClaudeClientProvider {
  public readonly client: Anthropic;

  constructor() {
    this.client = new Anthropic({
      apiKey: env.ANTHROPIC_API_KEY,
    });
  }
}
