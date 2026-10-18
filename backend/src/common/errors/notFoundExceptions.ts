import { NotFoundException } from '@nestjs/common';

export const ERROR_CODES = {
  UserNotFound: 'USER_NOT_FOUND',
  ShopNotFound: 'SHOP_NOT_FOUND',
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

export class UserNotFoundException extends NotFoundException {
  constructor() {
    super({
      statusCode: 404,
      code: ERROR_CODES.UserNotFound,
      message: 'User not found',
      error: 'Not Found',
    });
  }
}

export class ShopNotFoundException extends NotFoundException {
  constructor() {
    super({
      statusCode: 404,
      code: ERROR_CODES.ShopNotFound,
      message: 'Shop not found',
      error: 'Not Found',
    });
  }
}
