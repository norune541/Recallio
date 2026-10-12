import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller.js';
import { PrismaService } from '../../prisma/prisma.service.js';

@Module({
  imports: [TerminusModule],
  providers: [PrismaService],
  controllers: [HealthController],
})
export class HealthModule {}
