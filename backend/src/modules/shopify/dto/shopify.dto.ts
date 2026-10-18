import { ApiProperty } from '@nestjs/swagger';

export class ShopifyConnectQueryDto {
  @ApiProperty({
    description: 'Shop domain to connect, for example example.myshopify.com',
    example: 'example.myshopify.com',
    required: false,
  })
  shop?: string;
}

export class ShopifyCallbackQueryDto {
  @ApiProperty({
    description: 'Shop domain returned by Shopify',
    example: 'example.myshopify.com',
    required: false,
  })
  shop?: string;

  @ApiProperty({
    description:
      'Authorization code returned by Shopify after merchant consent',
    example: 'd9c8a3f0d1e2...',
    required: false,
  })
  code?: string;

  @ApiProperty({
    description: 'State value used to prevent CSRF attacks',
    example: 'shopify-state-123',
    required: false,
  })
  state?: string;

  @ApiProperty({
    description: 'Error code if the merchant declines the app request',
    example: 'access_denied',
    required: false,
  })
  error?: string;

  @ApiProperty({
    description: 'HMAC signature provided by Shopify',
    required: false,
  })
  hmac?: string;

  @ApiProperty({
    description: 'Timestamp of the OAuth callback',
    required: false,
  })
  timestamp?: string;
}

export class ShopifyCallbackResponseDto {
  @ApiProperty({
    description: 'Success message returned after connecting the store',
    example: 'Shopify store connected successfully',
  })
  message: string;

  @ApiProperty({
    description: 'Connected Shopify shop domain',
    example: 'example.myshopify.com',
  })
  shop: string;
}
