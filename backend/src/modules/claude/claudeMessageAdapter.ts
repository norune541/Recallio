import { Injectable } from '@nestjs/common';
import { InternalServerErrorException } from '@nestjs/common';
import { ClaudeClientProvider } from './claudeClientProvider.js';

@Injectable()
export class ClaudeMessageProvider {
  constructor(private readonly anthropic: ClaudeClientProvider) {}

  async sendMessage(message: string): Promise<string> {
    const response = await this.anthropic.client.messages.create({
      max_tokens: 1024,
      messages: [{ role: 'user', content: message }],
      model: 'claude-haiku-4-5',
    });

    for (const block of response.content) {
      if (block.type === 'text') {
        return block.text;
      }
    }

    throw new InternalServerErrorException(
      'Anthropic returned a response without a text block',
    );
  }
}
