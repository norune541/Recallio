import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import { Test } from '@nestjs/testing';
import request from 'supertest';

import { PrismaService } from 'backend/src/prisma/prisma.service.js';
import { ShopifyDao } from 'backend/src/modules/shopify/dao/shopify.dao.js';

import { DeleteShopifyMembershipUseCase } from 'backend/src/modules/shopify/use-cases/membership/delete-shopify-membership.use-case.js';
import { BeginShopifyAuthUseCase } from 'backend/src/modules/shopify/use-cases/auth/begin-shopify-auth.use-case.js';
import { CompleteShopifyAuthUseCase } from 'backend/src/modules/shopify/use-cases/auth/complete-shopify-auth.use-case.js';
import { GetProductsUseCase } from 'backend/src/modules/shopify/use-cases/api/get-products.js';
import { GetShopUseCase } from 'backend/src/modules/shopify/use-cases/api/get-shop.js';

import { ShopifyController } from 'backend/src/modules/shopify/shopify.controller.js';
import { ClerkAuthGuard } from 'backend/src/common/clerk-auth.guard.js';
import type { INestApplication } from '@nestjs/common';
import type { ExecutionContext } from '@nestjs/common';

describe('DELETE /api/integrations/shopify', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const testEmail = 'shopify-e2e@example.com';
  const clerkUserId = 'clerk_shopify_e2e_test';

  let userId: string;
  let shopId: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [ShopifyController],
      providers: [
        PrismaService,
        ShopifyDao,
        DeleteShopifyMembershipUseCase,
        {
          provide: BeginShopifyAuthUseCase,
          useValue: { execute: () => undefined },
        },
        {
          provide: CompleteShopifyAuthUseCase,
          useValue: { execute: () => undefined },
        },
        {
          provide: GetProductsUseCase,
          useValue: { execute: () => undefined },
        },
        {
          provide: GetShopUseCase,
          useValue: { execute: () => undefined },
        },
      ],
    })
      .overrideGuard(ClerkAuthGuard)
      .useValue({
        canActivate(context: ExecutionContext) {
          // Set the authenticated test user.
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          const req = context.switchToHttp().getRequest();

          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          req.user = {
            emailAddresses: [{ emailAddress: testEmail }],
          };

          return true;
        },
      })
      .compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();

    prisma = app.get(PrismaService);

    const user = await prisma.user.create({
      data: {
        clerkUserId,
        email: testEmail,
        imageUrl: '',
      },
    });
    userId = user.id;

    const shop = await prisma.shopifyShop.create({
      data: {
        shopDomain: 'shopify-e2e-test.myshopify.com',
        status: 'CONNECTED',
      },
    });
    shopId = shop.id;

    await prisma.shopMember.create({
      data: {
        userId: user.id,
        shopId: shop.id,
      },
    });
  });

  beforeEach(async () => {
    // Restore membership before each test.
    await prisma.shopMember.upsert({
      where: {
        shopId_userId: {
          shopId,
          userId,
        },
      },
      update: {
        role: 'MEMBER',
      },
      create: {
        shopId,
        userId,
        role: 'MEMBER',
      },
    });
  });

  afterAll(async () => {
    if (prisma) {
      await prisma.shopMember.deleteMany({
        where: {
          userId,
        },
      });

      if (shopId) {
        await prisma.shopifyShop.deleteMany({
          where: {
            id: shopId,
          },
        });
      }

      if (userId) {
        await prisma.user.deleteMany({
          where: {
            id: userId,
          },
        });
      }

      await prisma.$disconnect();
    }

    if (app) {
      await app.close();
    }
  });

  it('should delete the current user membership', async () => {
    const membership = await prisma.shopMember.findUnique({
      where: {
        shopId_userId: {
          shopId,
          userId,
        },
      },
    });

    expect(membership).not.toBeNull();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const response = await request(app.getHttpServer())
      .delete('/api/integrations/shopify')
      .expect(204);

    expect(response.text).toBe('');

    const membershipAfter = await prisma.shopMember.findUnique({
      where: {
        shopId_userId: {
          shopId,
          userId,
        },
      },
    });

    expect(membershipAfter).toBeNull();
  });

  it('should prevent the owner from leaving while other members remain', async () => {
    const otherUser = await prisma.user.create({
      data: {
        clerkUserId: 'clerk_shopify_other_test',
        email: 'shopify-other-e2e@example.com',
        imageUrl: '',
      },
    });

    try {
      await prisma.shopMember.update({
        where: {
          shopId_userId: {
            shopId,
            userId,
          },
        },
        data: {
          role: 'OWNER',
        },
      });

      await prisma.shopMember.create({
        data: {
          shopId,
          userId: otherUser.id,
          role: 'MEMBER',
        },
      });

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const response = await request(app.getHttpServer())
        .delete('/api/integrations/shopify')
        .expect(400);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.message).toBe(
        'Owner cannot leave the shop while other members remain. Transfer ownership first.',
      );

      const membership = await prisma.shopMember.findUnique({
        where: {
          shopId_userId: {
            shopId,
            userId,
          },
        },
      });

      expect(membership).not.toBeNull();
      expect(membership?.role).toBe('OWNER');
    } finally {
      await prisma.shopMember.deleteMany({
        where: {
          shopId,
          userId: otherUser.id,
        },
      });

      await prisma.user.delete({
        where: {
          id: otherUser.id,
        },
      });
    }
  });
});
