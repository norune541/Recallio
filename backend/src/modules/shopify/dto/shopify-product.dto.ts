import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { Prisma } from 'backend/src/generated/prisma/client.js';

export enum ProductStatus {
  ACTIVE = 'ACTIVE',
  ARCHIVED = 'ARCHIVED',
  DRAFT = 'DRAFT',
  UNLISTED = 'UNLISTED',
}

export enum InventoryPolicy {
  DENY = 'DENY',
  CONTINUE = 'CONTINUE',
}

export class ProductReviewDto {
  @ApiProperty({ example: 'Running Shoes Review' })
  seoTitle!: string;

  @ApiProperty({
    example: 'Discover the best running shoes for everyday training.',
  })
  seoMetaDescription!: string;

  @ApiProperty({
    description: 'AI-generated product insights',
    example: {
      summary: 'Comfortable running shoes for daily use',
      pros: ['Lightweight', 'Durable'],
      cons: ['Limited color options'],
    },
    type: Object,
  })
  insights!: Prisma.JsonValue;

  @ApiProperty({ type: Date })
  createdAt!: Date;

  @ApiProperty({ type: Date })
  updatedAt!: Date;
}

export class ProductVariantDto {
  @ApiProperty({ example: 'uuid-variant-id' })
  id!: string;

  @ApiProperty({
    example: 'gid://shopify/ProductVariant/123456789',
  })
  shopifyVariantId!: string;

  @ApiProperty({ example: 'Running Shoes - Size 42' })
  title!: string;

  @ApiPropertyOptional({
    example: 'SHOES-42',
    nullable: true,
    type: String,
  })
  sku!: string | null;

  @ApiPropertyOptional({
    example: '1234567890123',
    nullable: true,
    type: String,
  })
  barcode!: string | null;

  @ApiProperty({ example: '59.99', type: String })
  price!: string;

  @ApiPropertyOptional({
    example: '79.99',
    nullable: true,
    type: String,
  })
  compareAtPrice!: string | null;

  @ApiProperty({ example: 10 })
  inventoryQuantity!: number;

  @ApiProperty({
    enum: InventoryPolicy,
    enumName: 'InventoryPolicy',
    example: InventoryPolicy.CONTINUE,
  })
  inventoryPolicy!: InventoryPolicy;

  @ApiProperty({
    description: 'Selected variant options',
    example: [{ name: 'Size', value: '42' }],
    type: Object,
  })
  selectedOptions!: Prisma.JsonValue;
}

export class ProductResponseDto {
  @ApiProperty({ type: String })
  id!: string;

  @ApiProperty({ type: String })
  shopifyProductId!: string;

  @ApiProperty({ type: String })
  shopId!: string;

  @ApiProperty({ type: String })
  title!: string;

  @ApiProperty({ type: String })
  handle!: string;

  @ApiProperty({ type: String })
  description!: string;

  @ApiProperty({ type: String })
  descriptionHtml!: string;

  @ApiProperty({ type: String })
  vendor!: string;

  @ApiProperty({ type: String })
  productType!: string;

  @ApiProperty({ isArray: true, type: String })
  tags!: string[];

  @ApiProperty({ enum: ProductStatus, enumName: 'ProductStatus' })
  status!: ProductStatus;

  @ApiProperty({ type: Date })
  createdAt!: Date;

  @ApiProperty({ type: Date })
  updatedAt!: Date;

  @ApiPropertyOptional({ type: Date, nullable: true })
  publishedAt!: Date | null;

  @ApiProperty({ type: Number })
  totalInventory!: number;

  @ApiPropertyOptional({ type: String, nullable: true })
  seoTitle!: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  seoDescription!: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  featuredImageUrl!: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  featuredImageAltText!: string | null;

  @ApiPropertyOptional({ type: Number, nullable: true })
  featuredImageWidth!: number | null;

  @ApiPropertyOptional({ type: Number, nullable: true })
  featuredImageHeight!: number | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  onlineStoreUrl!: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  onlineStorePreviewUrl!: string | null;

  @ApiProperty({ type: Number })
  minVariantPrice!: number;

  @ApiProperty({ type: String })
  minVariantCurrency!: string;

  @ApiProperty({ type: Number })
  maxVariantPrice!: number;

  @ApiProperty({ type: String })
  maxVariantCurrency!: string;

  @ApiProperty({ type: Date })
  syncedAt!: Date;

  @ApiProperty({ type: Date })
  recordUpdatedAt!: Date;

  @ApiProperty({
    type: [ProductVariantDto],
    description: 'Product variants',
  })
  variants!: ProductVariantDto[];

  @ApiProperty({
    type: ProductReviewDto,
    nullable: true,
    description: 'AI-generated product review',
  })
  productReview!: ProductReviewDto | null;
}
