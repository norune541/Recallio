import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service.js';
import { Prisma } from 'backend/src/generated/prisma/client.js';
import type { ProductAIReview } from '../../claude/dto/product-review.js';
import type { ShopifyProductNode } from 'backend/src/common/types/products.js';

@Injectable()
export class ShopifyDao {
  constructor(private readonly prisma: PrismaService) {}

  async findUserIdByEmail(email: string) {
    return await this.prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
  }

  async createOAuthAttempt(input: {
    userId: string;
    stateHash: string;
    expiresAt: Date;
  }) {
    return await this.prisma.shopifyOAuthAttempt.create({
      data: {
        userId: input.userId,
        stateHash: input.stateHash,
        expiresAt: input.expiresAt,
      },
      select: { id: true },
    });
  }

  async findOAuthAttemptByStateHash(stateHash: string) {
    return await this.prisma.shopifyOAuthAttempt.findUnique({
      where: { stateHash },
      select: {
        id: true,
        userId: true,
        expiresAt: true,
        consumedAt: true,
      },
    });
  }

  async consumeOAuthAttempt(id: string): Promise<boolean> {
    const result = await this.prisma.shopifyOAuthAttempt.updateMany({
      where: {
        id,
        consumedAt: null,
        expiresAt: { gt: new Date() },
      },
      data: { consumedAt: new Date() },
    });
    return result.count === 1;
  }

  /** Saves shop credentials and membership in one database transaction. */
  async saveConnectedShopAndMember(input: {
    shopDomain: string;
    userId: string;
    grantedScopes: string[];
    accessTokenEncrypted: string;
    refreshTokenEncrypted: string;
    accessTokenExpiresAt: Date;
    refreshTokenExpiresAt: Date;
    connectedAt: Date;
  }): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const existingShop = await tx.shopifyShop.findUnique({
        where: { shopDomain: input.shopDomain },
        select: { id: true, members: { select: { userId: true }, take: 1 } },
      });

      const savedShop = await tx.shopifyShop.upsert({
        where: { shopDomain: input.shopDomain },
        create: {
          shopDomain: input.shopDomain,
          status: 'CONNECTED',
          grantedScopes: input.grantedScopes,
          accessTokenEncrypted: input.accessTokenEncrypted,
          refreshTokenEncrypted: input.refreshTokenEncrypted,
          accessTokenExpiresAt: input.accessTokenExpiresAt,
          refreshTokenExpiresAt: input.refreshTokenExpiresAt,
          connectedAt: input.connectedAt,
          uninstalledAt: null,
        },
        update: {
          status: 'CONNECTED',
          grantedScopes: input.grantedScopes,
          accessTokenEncrypted: input.accessTokenEncrypted,
          refreshTokenEncrypted: input.refreshTokenEncrypted,
          accessTokenExpiresAt: input.accessTokenExpiresAt,
          refreshTokenExpiresAt: input.refreshTokenExpiresAt,
          connectedAt: input.connectedAt,
          uninstalledAt: null,
        },
        select: { id: true },
      });

      await tx.shopMember.upsert({
        where: {
          shopId_userId: {
            shopId: savedShop.id,
            userId: input.userId,
          },
        },
        create: {
          shopId: savedShop.id,
          userId: input.userId,
          role: existingShop?.members.length ? 'MEMBER' : 'OWNER',
        },
        // Preserve an existing member's role when the shop is reconnected.
        update: {},
      });
    });
  }

  async findTokenState(shopDomain: string) {
    return await this.prisma.shopifyShop.findUnique({
      where: { shopDomain },
      select: {
        status: true,
        accessTokenEncrypted: true,
        refreshTokenEncrypted: true,
        accessTokenExpiresAt: true,
        refreshTokenExpiresAt: true,
      },
    });
  }

  async findRefreshState(shopDomain: string) {
    return await this.prisma.shopifyShop.findUnique({
      where: { shopDomain },
      select: {
        status: true,
        refreshTokenEncrypted: true,
        grantedScopes: true,
      },
    });
  }

  async saveRefreshedTokens(input: {
    shopDomain: string;
    accessTokenEncrypted: string;
    refreshTokenEncrypted: string;
    accessTokenExpiresAt: Date;
    refreshTokenExpiresAt: Date;
    grantedScopes: string[];
  }) {
    return await this.prisma.shopifyShop.update({
      where: { shopDomain: input.shopDomain },
      data: {
        accessTokenEncrypted: input.accessTokenEncrypted,
        refreshTokenEncrypted: input.refreshTokenEncrypted,
        accessTokenExpiresAt: input.accessTokenExpiresAt,
        refreshTokenExpiresAt: input.refreshTokenExpiresAt,
        grantedScopes: input.grantedScopes,
        status: 'CONNECTED',
      },
    });
  }

  async removeShop(shopDomain: string): Promise<void> {
    await this.prisma.shopifyShop.delete({
      where: {
        shopDomain,
      },
    });
  }
  async markShopDisconnected(shopDomain: string) {
    return await this.prisma.shopifyShop.updateMany({
      where: { shopDomain },
      data: {
        status: 'DISCONNECTED',
        accessTokenEncrypted: null,
        refreshTokenEncrypted: null,
        accessTokenExpiresAt: null,
        refreshTokenExpiresAt: null,
      },
    });
  }

  async findShopByUserId(userId: string) {
    const membership = await this.prisma.shopMember.findFirst({
      where: {
        userId,
        shop: {
          status: 'CONNECTED',
        },
      },
      select: {
        shop: {
          select: {
            id: true,
            shopDomain: true,
            status: true,
          },
        },
      },
    });

    return membership?.shop ?? null;
  }

  async findShopByDomain(shopDomain: string) {
    return await this.prisma.shopifyShop.findUnique({
      where: {
        shopDomain,
      },
      select: {
        status: true,
      },
    });
  }

  async findMembers(shopId: string, userId: string) {
    return await this.prisma.shopMember.findMany({
      where: {
        shopId,
        userId: {
          not: userId,
        },
      },
      select: {
        userId: true,
        role: true,
      },
    });
  }

  async findRole(userId: string, shopId: string) {
    const member = await this.prisma.shopMember.findUnique({
      where: {
        shopId_userId: { shopId, userId },
      },
      select: {
        role: true,
      },
    });

    return member?.role ?? null;
  }
  async findConnectedShops() {
    return await this.prisma.shopifyShop.findMany({
      where: {
        status: 'CONNECTED',
      },
      select: {
        id: true,
        shopDomain: true,
      },
    });
  }
  async findProductsByShopId(shopId: string) {
    return await this.prisma.product.findMany({
      where: { shopId },
      select: {
        id: true,
        shopifyProductId: true,
        updatedAt: true,
        syncedAt: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });
  }

  async findProductsUpdatedAt(shopId: string, shopifyProductIds: string[]) {
    return await this.prisma.product.findMany({
      where: {
        shopId,
        shopifyProductId: {
          in: shopifyProductIds,
        },
      },
      select: {
        shopifyProductId: true,
        updatedAt: true,
      },
    });
  }

  async upsertProductWithReview(
    shopId: string,
    product: ShopifyProductNode,
    review: ProductAIReview,
  ): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const savedProduct = await tx.product.upsert({
        where: {
          shopId_shopifyProductId: {
            shopId,
            shopifyProductId: product.id,
          },
        },
        create: {
          shopId,
          shopifyProductId: product.id,
          title: product.title,
          handle: product.handle,
          description: product.description,
          descriptionHtml: product.descriptionHtml,
          vendor: product.vendor,
          productType: product.productType,
          tags: product.tags,
          status: product.status,
          createdAt: new Date(product.createdAt),
          updatedAt: new Date(product.updatedAt),
          publishedAt: product.publishedAt
            ? new Date(product.publishedAt)
            : null,
          totalInventory: product.totalInventory,
          seoTitle: product.seo.title,
          seoDescription: product.seo.description,
          featuredImageUrl: product.featuredMedia?.preview?.image?.url ?? null,
          featuredImageAltText:
            product.featuredMedia?.preview?.image?.altText ?? null,
          featuredImageWidth:
            product.featuredMedia?.preview?.image?.width ?? null,
          featuredImageHeight:
            product.featuredMedia?.preview?.image?.height ?? null,
          onlineStoreUrl: product.onlineStoreUrl,
          onlineStorePreviewUrl: product.onlineStorePreviewUrl,
          minVariantPrice: new Prisma.Decimal(
            product.priceRangeV2.minVariantPrice.amount,
          ),
          minVariantCurrency: product.priceRangeV2.minVariantPrice.currencyCode,
          maxVariantPrice: new Prisma.Decimal(
            product.priceRangeV2.maxVariantPrice.amount,
          ),
          maxVariantCurrency: product.priceRangeV2.maxVariantPrice.currencyCode,
        },
        update: {
          title: product.title,
          handle: product.handle,
          description: product.description,
          descriptionHtml: product.descriptionHtml,
          vendor: product.vendor,
          productType: product.productType,
          tags: product.tags,
          status: product.status,
          createdAt: new Date(product.createdAt),
          updatedAt: new Date(product.updatedAt),
          publishedAt: product.publishedAt
            ? new Date(product.publishedAt)
            : null,
          totalInventory: product.totalInventory,
          seoTitle: product.seo.title,
          seoDescription: product.seo.description,
          featuredImageUrl: product.featuredMedia?.preview?.image?.url ?? null,
          featuredImageAltText:
            product.featuredMedia?.preview?.image?.altText ?? null,
          featuredImageWidth:
            product.featuredMedia?.preview?.image?.width ?? null,
          featuredImageHeight:
            product.featuredMedia?.preview?.image?.height ?? null,
          onlineStoreUrl: product.onlineStoreUrl,
          onlineStorePreviewUrl: product.onlineStorePreviewUrl,
          minVariantPrice: new Prisma.Decimal(
            product.priceRangeV2.minVariantPrice.amount,
          ),
          minVariantCurrency: product.priceRangeV2.minVariantPrice.currencyCode,
          maxVariantPrice: new Prisma.Decimal(
            product.priceRangeV2.maxVariantPrice.amount,
          ),
          maxVariantCurrency: product.priceRangeV2.maxVariantPrice.currencyCode,
          syncedAt: new Date(),
        },
        select: { id: true },
      });

      for (const variant of product.variants.nodes) {
        await tx.productVariant.upsert({
          where: {
            productId_shopifyVariantId: {
              productId: savedProduct.id,
              shopifyVariantId: variant.id,
            },
          },
          create: {
            productId: savedProduct.id,
            shopifyVariantId: variant.id,
            title: variant.title,
            sku: variant.sku,
            barcode: variant.barcode,
            price: new Prisma.Decimal(variant.price),
            compareAtPrice: variant.compareAtPrice
              ? new Prisma.Decimal(variant.compareAtPrice)
              : null,
            inventoryQuantity: variant.inventoryQuantity,
            inventoryPolicy: variant.inventoryPolicy,
            selectedOptions: variant.selectedOptions,
          },
          update: {
            title: variant.title,
            sku: variant.sku,
            barcode: variant.barcode,
            price: new Prisma.Decimal(variant.price),
            compareAtPrice: variant.compareAtPrice
              ? new Prisma.Decimal(variant.compareAtPrice)
              : null,
            inventoryQuantity: variant.inventoryQuantity,
            inventoryPolicy: variant.inventoryPolicy,
            selectedOptions: variant.selectedOptions,
          },
        });
      }

      await tx.productReview.upsert({
        where: { productId: savedProduct.id },
        create: {
          productId: savedProduct.id,
          seoTitle: review.seo.title,
          seoMetaDescription: review.seo.metaDescription,
          insights: review.insights,
        },
        update: {
          seoTitle: review.seo.title,
          seoMetaDescription: review.seo.metaDescription,
          insights: review.insights,
        },
      });
    });
  }
}
