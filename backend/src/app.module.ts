import { Module } from '@nestjs/common';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

import { HealthModule } from './modules/health/health.module.js';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module.js';
import { UserModule } from './modules/user/user.module.js';
import { ShopifyModule } from './modules/shopify/shopify.module.js';
import { ClerkModule } from './modules/clerk/clerk.module.js';

@Module({
  imports: [
    HealthModule,
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    UserModule,
    ShopifyModule,
    ClerkModule,
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60_000,
          limit: 100,
        },
      ],
    }),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
