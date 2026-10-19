import { NotFoundException } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export class ShopNotFoundException extends NotFoundException {
  constructor() {
    super({
      statusCode: 404,
      code: 'SHOP_NOT_FOUND',
      message: 'Shop not found',
      error: 'Not Found',
    } satisfies ShopNotFoundDto);
  }
}

export class ShopNotFoundDto {
  @ApiProperty({ description: 'HTTP status code', example: 404, enum: [404] })
  statusCode!: 404;

  @ApiProperty({
    description: 'Machine-readable error code',
    example: 'SHOP_NOT_FOUND',
    enum: ['SHOP_NOT_FOUND'],
  })
  code!: 'SHOP_NOT_FOUND';

  @ApiProperty({
    description: 'Human-readable error code',
    example: 'Shop not found',
  })
  message!: 'Shop not found';

  @ApiProperty({ description: 'HTTP status text', example: 'Not Found' })
  error!: 'Not Found';
}
