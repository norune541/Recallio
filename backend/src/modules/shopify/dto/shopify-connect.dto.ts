import { ApiProperty } from '@nestjs/swagger';

export class ShopifyConnectResponseDto {
  @ApiProperty({
    example: 'https://example.myshopify.com/admin/oauth/authorize?...',
    description: 'Shopify authorization URL to redirect the user to',
  })
  url!: string;
}
