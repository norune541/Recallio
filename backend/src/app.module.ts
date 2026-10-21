import { Module } from '@nestjs/common';

import { HealthModule } from './modules/health/health.module.js';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module.js';
import { UserModule } from './modules/user/user.module.js';
import { ShopifyModule } from './modules/shopify/shopify.module.js';
import { ClerkModule } from './modules/clerk/clerk.module.js';

@Module({
  imports: [
    HealthModule,
    ConfigModule.forRoot(),
    PrismaModule,
    UserModule,
    ShopifyModule,
    ClerkModule,
  ],
})
export class AppModule {}
