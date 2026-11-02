import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClaudeClientProvider } from './claudeClientProvider.js';
import { ClaudeMessageProvider } from './claudeMessageAdapter.js';
import { AnalyzeProductUseCase } from './use-cases/analyze-products.js';

@Module({
  imports: [ConfigModule],
  providers: [
    ClaudeClientProvider,
    ClaudeMessageProvider,
    AnalyzeProductUseCase,
  ],
  exports: [AnalyzeProductUseCase],
})
export class ClaudeModule {}
