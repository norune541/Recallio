import { BadRequestException, Injectable } from '@nestjs/common';

import { ShopifyDao } from '../../dao/shopify.dao.js';
import { UserNotFoundException } from 'backend/src/modules/user/dto/UserNotFound.dto.js';
import { ShopNotFoundException } from '../../dto/shop-notFound.dto.js';

@Injectable()
export class DeleteShopifyMembershipUseCase {
  constructor(private readonly shopifyDao: ShopifyDao) {}

  async execute(email: string) {
    const user = await this.shopifyDao.findUserIdByEmail(email);
    if (!user) throw new UserNotFoundException();

    const shop = await this.shopifyDao.findShopByUserId(user.id);
    if (!shop) throw new ShopNotFoundException();

    const role = await this.shopifyDao.findRole(user.id, shop.id);
    const members = await this.shopifyDao.findMembers(shop.id, user.id);

    if (role === 'OWNER' && members.length > 0) {
      throw new BadRequestException(
        'Owner cannot leave the shop while other members remain. Transfer ownership first.',
      );
    }

    await this.shopifyDao.removeUserMembership(shop.id, user.id);
  }
}
