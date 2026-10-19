import { ApiProperty } from '@nestjs/swagger';

export class ShopifyShopPrimaryDomainDto {
  @ApiProperty({
    description: 'Primary domain host name',
    example: 'shop.example.com',
  })
  host!: string;

  @ApiProperty({
    description: 'Primary domain URL',
    example: 'https://shop.example.com',
  })
  url!: string;
}

export class ShopifyShopPlanDto {
  @ApiProperty({
    description: 'Human-readable name of the Shopify plan',
    example: 'Basic',
  })
  displayName!: string;

  @ApiProperty({
    description: 'True for Partner development stores',
    example: false,
  })
  partnerDevelopment!: boolean;

  @ApiProperty({
    description: 'True for Shopify Plus stores',
    example: false,
  })
  shopifyPlus!: boolean;
}

export class ShopifyShopDto {
  @ApiProperty({
    description: 'Shopify shop ID in GraphQL format',
    example: 'gid://shopify/Shop/12345678',
  })
  id!: string;

  @ApiProperty({ description: 'Shop name', example: 'My Store' })
  name!: string;

  @ApiProperty({
    description: 'The shop .myshopify.com domain',
    example: 'example.myshopify.com',
  })
  myshopifyDomain!: string;

  @ApiProperty({
    description: 'Online store URL',
    example: 'https://example.myshopify.com',
  })
  url!: string;

  @ApiProperty({
    description: 'Shop owner email, used by Shopify to contact the owner',
    example: 'owner@example.com',
  })
  email!: string;

  @ApiProperty({
    description: 'Public contact email shown to customers',
    example: 'support@example.com',
  })
  contactEmail!: string;

  @ApiProperty({ description: 'Shop owner name', example: 'Jane Doe' })
  shopOwnerName!: string;

  @ApiProperty({
    description: 'Currency the shop sells in (ISO 4217)',
    example: 'USD',
  })
  currencyCode!: string;

  @ApiProperty({
    description: 'Presentment currencies enabled for the shop (ISO 4217)',
    type: [String],
    example: ['USD', 'EUR'],
  })
  enabledPresentmentCurrencies!: string[];

  @ApiProperty({
    description: 'Shop time zone as defined by IANA',
    example: 'Europe/Berlin',
  })
  ianaTimezone!: string;

  @ApiProperty({
    description: 'Shop time zone abbreviation',
    example: 'CET',
  })
  timezoneAbbreviation!: string;

  @ApiProperty({
    description: 'Shop creation timestamp (ISO 8601)',
    example: '2024-05-17T09:30:00Z',
  })
  createdAt!: string;

  @ApiProperty({
    description: 'Primary domain of the online store',
    type: () => ShopifyShopPrimaryDomainDto,
  })
  primaryDomain!: ShopifyShopPrimaryDomainDto;

  @ApiProperty({
    description: 'Shopify billing plan of the shop',
    type: () => ShopifyShopPlanDto,
  })
  plan!: ShopifyShopPlanDto;

  @ApiProperty({
    description: 'Countries the shop ships to (ISO 3166-1 alpha-2)',
    type: [String],
    example: ['US', 'CA', 'DE'],
  })
  shipsToCountries!: string[];

  @ApiProperty({
    description: 'Whether the shop has outstanding setup steps',
    example: false,
  })
  setupRequired!: boolean;
}

/** 401: the Clerk token is missing or invalid (thrown by ClerkAuthGuard). */
export class ShopifyShopUnauthorizedErrorDto {
  @ApiProperty({ description: 'HTTP status code', example: 401 })
  statusCode!: number;

  @ApiProperty({ description: 'Error message', example: 'Unauthorized' })
  message!: string;
}

/** 404: the user or their connected shop was not found. */
export class ShopifyShopNotFoundErrorDto {
  @ApiProperty({ description: 'HTTP status code', example: 404 })
  statusCode!: number;

  @ApiProperty({
    description: 'Machine-readable error code',
    enum: ['SHOP_NOT_FOUND'],
    example: ['SHOP_NOT_FOUND'],
  })
  code!: 'SHOP_NOT_FOUND';

  @ApiProperty({
    description: 'Human-readable message',
    example: 'Shop not found',
  })
  message!: string;

  @ApiProperty({ description: 'HTTP status text', example: 'Not Found' })
  error!: string;
}

/** 502: Shopify returned a GraphQL error or an empty response. */
export class ShopifyShopBadGatewayErrorDto {
  @ApiProperty({ description: 'HTTP status code', example: 502 })
  statusCode!: number;

  @ApiProperty({
    description: 'Shopify error message or a fallback message',
    example: 'Shopify GraphQL request failed',
  })
  message!: string;

  @ApiProperty({ description: 'HTTP status text', example: 'Bad Gateway' })
  error!: string;
}
