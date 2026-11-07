import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClaudeClientProvider } from './claudeClientProvider.js';
import { ClaudeMessageAdapter } from './claudeMessageAdapter.js';

@Module({
  imports: [ConfigModule],
  providers: [ClaudeClientProvider, ClaudeMessageAdapter],
  exports: [ClaudeMessageAdapter],
})
export class ClaudeModule {}
