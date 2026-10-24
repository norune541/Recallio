import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service.js';

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

  async removeUserMembership(shopId: string, userId: string): Promise<void> {
    await this.prisma.shopMember.delete({
      where: {
        shopId_userId: {
          shopId,
          userId,
        },
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
    const membership = await this.prisma.shopMember.findUnique({
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
}
