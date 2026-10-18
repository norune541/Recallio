import { ApiProperty } from '@nestjs/swagger';
import { ERROR_CODES, type ErrorCode } from './notFoundExceptions.js';

export class NotFoundErrorDto {
  @ApiProperty({ description: 'HTTP status code', example: 404 })
  statusCode!: number;

  @ApiProperty({
    description:
      'Machine-readable error code: USER_NOT_FOUND if the user has no record, ' +
      'SHOP_NOT_FOUND if the user has no connected shop',
    enum: [ERROR_CODES.UserNotFound, ERROR_CODES.ShopNotFound],
    example: ERROR_CODES.ShopNotFound,
  })
  code!: ErrorCode;

  @ApiProperty({
    description: 'Human-readable message, not intended for programmatic checks',
    enum: ['User not found', 'Shop not found'],
    example: 'Shop not found',
  })
  message!: string;

  @ApiProperty({ description: 'HTTP status text', example: 'Not Found' })
  error!: string;
}