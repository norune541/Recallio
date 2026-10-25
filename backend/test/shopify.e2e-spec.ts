import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import { Test } from '@nestjs/testing';
import request from 'supertest';

import { PrismaService } from 'backend/src/prisma/prisma.service.js';
import { ShopifyDao } from 'backend/src/modules/shopify/dao/shopify.dao.js';

import { DeleteShop } from 'backend/src/modules/shopify/use-cases/shop/delete-shop.use-case.js';
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
  const otherEmail = 'shopify-other-e2e@example.com';
  const otherClerkUserId = 'clerk_shopify_other_test';
  const shopDomain = 'shopify-e2e-test.myshopify.com';

  let userId: string;
  let otherUserId: string;
  let shopId: string;

  const cleanupShop = async () => {
    const shops = await prisma.shopifyShop.findMany({
      where: { shopDomain },
      select: { id: true },
    });
    const ids = shops.map((s) => s.id);

    if (ids.length > 0) {
      await prisma.shopMember.deleteMany({ where: { shopId: { in: ids } } });
      await prisma.shopifyShop.deleteMany({ where: { id: { in: ids } } });
    }
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [ShopifyController],
      providers: [
        PrismaService,
        ShopifyDao,
        DeleteShop,
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

    const otherUser = await prisma.user.create({
      data: {
        clerkUserId: otherClerkUserId,
        email: otherEmail,
        imageUrl: '',
      },
    });
    otherUserId = otherUser.id;
  });

  beforeEach(async () => {
    // The shop is deleted by some tests, so recreate it from scratch every time.
    await cleanupShop();

    const shop = await prisma.shopifyShop.create({
      data: {
        shopDomain,
        status: 'CONNECTED',
      },
    });
    shopId = shop.id;

    await prisma.shopMember.create({
      data: {
        shopId,
        userId,
        role: 'OWNER',
      },
    });
  });

  afterAll(async () => {
    if (prisma) {
      await cleanupShop();

      await prisma.shopMember.deleteMany({
        where: { userId: { in: [userId, otherUserId] } },
      });

      await prisma.user.deleteMany({
        where: { id: { in: [userId, otherUserId] } },
      });

      await prisma.$disconnect();
    }

    if (app) {
      await app.close();
    }
  });

  it('should delete the shop if the user is the owner and no other members remain', async () => {
    const shopBefore = await prisma.shopifyShop.findUnique({
      where: { id: shopId },
    });
    expect(shopBefore).not.toBeNull();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const response = await request(app.getHttpServer())
      .delete('/api/integrations/shopify')
      .expect(204);

    expect(response.text).toBe('');

    const shopAfter = await prisma.shopifyShop.findUnique({
      where: { id: shopId },
    });
    expect(shopAfter).toBeNull();

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

  it('should forbid deleting the shop if the user is not the owner', async () => {
    await prisma.shopMember.update({
      where: {
        shopId_userId: {
          shopId,
          userId,
        },
      },
      data: {
        role: 'MEMBER',
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const response = await request(app.getHttpServer())
      .delete('/api/integrations/shopify')
      .expect(403);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(response.body.message).toBe(
      'Only the shop owner can delete the shop.',
    );

    const shop = await prisma.shopifyShop.findUnique({
      where: { id: shopId },
    });
    expect(shop).not.toBeNull();

    const membership = await prisma.shopMember.findUnique({
      where: {
        shopId_userId: {
          shopId,
          userId,
        },
      },
    });
    expect(membership).not.toBeNull();
    expect(membership?.role).toBe('MEMBER');
  });

  it('should prevent the owner from deleting the shop while other members remain', async () => {
    await prisma.shopMember.create({
      data: {
        shopId,
        userId: otherUserId,
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

    const shop = await prisma.shopifyShop.findUnique({
      where: { id: shopId },
    });
    expect(shop).not.toBeNull();

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

    const otherMembership = await prisma.shopMember.findUnique({
      where: {
        shopId_userId: {
          shopId,
          userId: otherUserId,
        },
      },
    });
    expect(otherMembership).not.toBeNull();
  });
});
