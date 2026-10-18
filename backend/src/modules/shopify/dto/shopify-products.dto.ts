import { ApiProperty } from '@nestjs/swagger';

export class ShopifyMoneyDto {
  @ApiProperty({
    description: 'Product price amount',
    example: '59.99',
  })
  amount: string;

  @ApiProperty({
    description: 'Currency code',
    example: 'USD',
  })
  currencyCode: string;
}

export class ShopifyPriceRangeDto {
  @ApiProperty({ type: ShopifyMoneyDto, description: 'Minimum variant price' })
  minVariantPrice: ShopifyMoneyDto;

  @ApiProperty({ type: ShopifyMoneyDto, description: 'Maximum variant price' })
  maxVariantPrice: ShopifyMoneyDto;
}

export class ShopifyImageDto {
  @ApiProperty({
    description: 'Image URL',
    example: 'https://cdn.shopify.com/s/files/1/0000/0000/products/shoes.jpg',
  })
  url: string;

  @ApiProperty({
    description: 'Image alternative text',
    example: 'Red running shoes',
    type: String,
    nullable: true,
  })
  altText: string | null;

  @ApiProperty({
    description:
      'Original image width in pixels, null if the image is not hosted by Shopify',
    example: 1200,
    type: Number,
    nullable: true,
  })
  width: number | null;

  @ApiProperty({
    description:
      'Original image height in pixels, null if the image is not hosted by Shopify',
    example: 800,
    type: Number,
    nullable: true,
  })
  height: number | null;
}

export class ShopifyMediaPreviewDto {
  @ApiProperty({
    type: ShopifyImageDto,
    description: 'Preview image of the media',
    nullable: true,
  })
  image: ShopifyImageDto | null;
}

export class ShopifyFeaturedMediaDto {
  @ApiProperty({
    type: ShopifyMediaPreviewDto,
    description: 'Preview of the featured media',
    nullable: true,
  })
  preview: ShopifyMediaPreviewDto | null;
}

export class ShopifyProductDto {
  @ApiProperty({
    description: 'Shopify product ID in GraphQL format',
    example: 'gid://shopify/Product/123456789',
  })
  id: string;

  @ApiProperty({
    description: 'Product title',
    example: 'Running Shoes',
  })
  title: string;

  @ApiProperty({
    description: 'URL-safe product handle',
    example: 'running-shoes',
  })
  handle: string;

  @ApiProperty({
    description: 'Product vendor',
    example: 'Northwind',
  })
  vendor: string;

  @ApiProperty({
    description: 'Product type',
    example: 'Footwear',
  })
  productType: string;

  @ApiProperty({
    description: 'Product tags',
    example: ['sport', 'new-arrivals'],
    type: [String],
  })
  tags: string[];

  @ApiProperty({
    description: 'Product publication status',
    enum: ['ACTIVE', 'ARCHIVED', 'DRAFT', 'UNLISTED'],
    example: 'ACTIVE',
  })
  status: 'ACTIVE' | 'ARCHIVED' | 'DRAFT' | 'UNLISTED';

  @ApiProperty({
    description: 'Product creation timestamp',
    example: '2024-01-15T10:30:00Z',
  })
  createdAt: string;

  @ApiProperty({
    description: 'Product last update timestamp',
    example: '2024-01-20T12:00:00Z',
  })
  updatedAt: string;

  @ApiProperty({
    description: 'Product publication timestamp',
    example: '2024-01-18T09:00:00Z',
    type: String,
    nullable: true,
  })
  publishedAt: string | null;

  @ApiProperty({
    description: 'Total inventory count across all variants',
    example: 24,
  })
  totalInventory: number;

  @ApiProperty({
    type: ShopifyFeaturedMediaDto,
    description:
      'Featured media of the product, null if the product has no media',
    nullable: true,
  })
  featuredMedia: ShopifyFeaturedMediaDto | null;

  @ApiProperty({
    description: 'Online store product URL',
    example: 'https://example.myshopify.com/products/running-shoes',
    type: String,
    nullable: true,
  })
  onlineStoreUrl: string | null;

  @ApiProperty({
    description: 'Online store preview URL',
    example:
      'https://example.myshopify.com/products/running-shoes?preview=true',
    type: String,
    nullable: true,
  })
  onlineStorePreviewUrl: string | null;

  @ApiProperty({
    type: ShopifyPriceRangeDto,
    description: 'Product price range',
  })
  priceRangeV2: ShopifyPriceRangeDto;
}
