import { ApiProperty } from '@nestjs/swagger';
import type { Prisma } from 'backend/src/generated/prisma/client.js';

export class ProductVariantDto {
  @ApiProperty({ example: 'uuid-variant-id' })
  id: string;

  @ApiProperty({ example: 'gid://shopify/ProductVariant/123456789' })
  shopifyVariantId: string;

  @ApiProperty({ example: 'Running Shoes - Size 42' })
  title: string;

  @ApiProperty({ example: 'SHOES-42', nullable: true, type: String })
  sku: string | null;

  @ApiProperty({ example: '1234567890123', nullable: true, type: String })
  barcode: string | null;

  @ApiProperty({ example: '59.99', type: String })
  price: string;

  @ApiProperty({
    example: '79.99',
    nullable: true,
    type: String,
  })
  compareAtPrice: string | null;

  @ApiProperty({ example: 10 })
  inventoryQuantity: number;

  @ApiProperty({
    enum: ['DENY', 'CONTINUE'],
    example: 'CONTINUE',
  })
  inventoryPolicy: 'DENY' | 'CONTINUE';

  @ApiProperty({
    description: 'Selected variant options',
    example: [{ name: 'Size', value: '42' }],
    type: Object,
  })
  selectedOptions: Prisma.JsonValue;
}

export class ProductReviewDto {
  @ApiProperty({ example: 'Running Shoes Review' })
  seoTitle: string;

  @ApiProperty({
    example: 'Discover the best running shoes for everyday training.',
  })
  seoMetaDescription: string;

  @ApiProperty({
    description: 'AI-generated product insights',
    example: {
      summary: 'Comfortable running shoes for daily use',
      pros: ['Lightweight', 'Durable'],
    },
    type: Object,
  })
  insights: Prisma.JsonValue;

  @ApiProperty({ example: '2024-01-20T12:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-20T12:00:00.000Z' })
  updatedAt: Date;
}

export class ShopifyProductDto {
  @ApiProperty({ example: 'uuid-product-id' })
  id: string;

  @ApiProperty({
    example: 'gid://shopify/Product/123456789',
  })
  shopifyProductId: string;

  @ApiProperty({ example: 'Running Shoes' })
  title: string;

  @ApiProperty({ example: 'running-shoes' })
  handle: string;

  @ApiProperty({ example: 'Comfortable running shoes' })
  description: string;

  @ApiProperty({ example: '<p>Comfortable running shoes</p>' })
  descriptionHtml: string;

  @ApiProperty({ example: 'Northwind' })
  vendor: string;

  @ApiProperty({ example: 'Footwear' })
  productType: string;

  @ApiProperty({
    type: [String],
    example: ['sport', 'new-arrivals'],
  })
  tags: string[];

  @ApiProperty({
    enum: ['ACTIVE', 'ARCHIVED', 'DRAFT', 'UNLISTED'],
    example: 'ACTIVE',
  })
  status: 'ACTIVE' | 'ARCHIVED' | 'DRAFT' | 'UNLISTED';

  @ApiProperty({ example: '2024-01-15T10:30:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-20T12:00:00.000Z' })
  updatedAt: Date;

  @ApiProperty({
    example: '2024-01-18T09:00:00.000Z',
    nullable: true,
    type: Date,
  })
  publishedAt: Date | null;

  @ApiProperty({ example: 24 })
  totalInventory: number;

  @ApiProperty({ nullable: true, type: String })
  seoTitle: string | null;

  @ApiProperty({ nullable: true, type: String })
  seoDescription: string | null;

  @ApiProperty({ nullable: true, type: String })
  featuredImageUrl: string | null;

  @ApiProperty({ nullable: true, type: String })
  featuredImageAltText: string | null;

  @ApiProperty({ nullable: true, type: Number })
  featuredImageWidth: number | null;

  @ApiProperty({ nullable: true, type: Number })
  featuredImageHeight: number | null;

  @ApiProperty({ nullable: true, type: String })
  onlineStoreUrl: string | null;

  @ApiProperty({ nullable: true, type: String })
  onlineStorePreviewUrl: string | null;

  @ApiProperty({ example: '59.99', type: String })
  minVariantPrice: string;

  @ApiProperty({ example: 'USD' })
  minVariantCurrency: string;

  @ApiProperty({ example: '79.99', type: String })
  maxVariantPrice: string;

  @ApiProperty({ example: 'USD' })
  maxVariantCurrency: string;

  @ApiProperty({
    type: [ProductVariantDto],
    description: 'Product variants',
  })
  variants: ProductVariantDto[];

  @ApiProperty({
    type: ProductReviewDto,
    nullable: true,
    description: 'AI-generated product review',
  })
  productReview: ProductReviewDto | null;
}

export class ShopifyPageInfoDto {
  @ApiProperty({
    description: 'Whether more products are available',
    example: true,
  })
  hasNextPage: boolean;

  @ApiProperty({
    description: 'UUID of the last product in the current page',
    example: '550e8400-e29b-41d4-a716-446655440000',
    nullable: true,
    type: String,
  })
  endCursor: string | null;
}

export class ShopifyProductsResponseDto {
  @ApiProperty({
    type: [ShopifyProductDto],
    description: 'Products retrieved from the database',
  })
  items: ShopifyProductDto[];

  @ApiProperty({
    type: ShopifyPageInfoDto,
    description: 'Pagination information',
  })
  pageInfo: ShopifyPageInfoDto;
}
