import { Injectable } from '@nestjs/common';

import { ShopifyDao } from '../../dao/shopify.dao.js';
import { UserNotFoundException } from 'backend/src/modules/user/dto/UserNotFound.dto.js';
import { ShopNotFoundException } from '../../dto/shop-notFound.dto.js';

@Injectable()
export class DeleteShopifyMembershipUseCase {
  constructor(private readonly shopifyDao: ShopifyDao) {}

  async execute(email: string): Promise<void> {
    const user = await this.shopifyDao.findUserIdByEmail(email);
    if (!user) throw new UserNotFoundException();

    const shop = await this.shopifyDao.findShopByUserId(user.id);
    if (!shop) throw new ShopNotFoundException();

    await this.shopifyDao.removeUserMemebership(shop.id, user.id);
  }
}
