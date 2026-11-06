import { ApiProperty } from '@nestjs/swagger';

import type {
  ShopifyProductNode,
  ProductStatus,
} from 'backend/src/common/types/products.js';

import type { ProductAIReview } from '../../claude/dto/product-review.js';

export type ProductReviewResponseDto = {
  shop: {
    primaryDomain: {
      url: string;
    } | null;
  };
  product: ShopifyProductNode;
  aiReview: ProductAIReview;
};

class ProductReviewShopDomainDto {
  @ApiProperty({ type: String })
  url!: string;
}

class ProductReviewShopDto {
  @ApiProperty({
    type: () => ProductReviewShopDomainDto,
    nullable: true,
  })
  primaryDomain!: ProductReviewShopDomainDto | null;
}

class ProductReviewSeoDto {
  @ApiProperty({ type: String, nullable: true })
  title!: string | null;

  @ApiProperty({ type: String, nullable: true })
  description!: string | null;
}

class ProductReviewImageDto {
  @ApiProperty({ type: String })
  url!: string;

  @ApiProperty({ type: String, nullable: true })
  altText!: string | null;

  @ApiProperty({ type: Number, nullable: true })
  width!: number | null;

  @ApiProperty({ type: Number, nullable: true })
  height!: number | null;
}

class ProductReviewMediaPreviewDto {
  @ApiProperty({
    type: () => ProductReviewImageDto,
    nullable: true,
  })
  image!: ProductReviewImageDto | null;
}

class ProductReviewFeaturedMediaDto {
  @ApiProperty({
    type: () => ProductReviewMediaPreviewDto,
    nullable: true,
  })
  preview!: ProductReviewMediaPreviewDto | null;
}

class ProductReviewMoneyDto {
  @ApiProperty({ type: String, example: '19.99' })
  amount!: string;

  @ApiProperty({ type: String, example: 'USD' })
  currencyCode!: string;
}

class ProductReviewPriceRangeDto {
  @ApiProperty({ type: () => ProductReviewMoneyDto })
  minVariantPrice!: ProductReviewMoneyDto;

  @ApiProperty({ type: () => ProductReviewMoneyDto })
  maxVariantPrice!: ProductReviewMoneyDto;
}

class ProductReviewSelectedOptionDto {
  @ApiProperty({ type: String })
  name!: string;

  @ApiProperty({ type: String })
  value!: string;
}

class ProductReviewVariantDto {
  @ApiProperty({ type: String })
  id!: string;

  @ApiProperty({ type: String })
  title!: string;

  @ApiProperty({ type: String, nullable: true })
  sku!: string | null;

  @ApiProperty({ type: String, nullable: true })
  barcode!: string | null;

  @ApiProperty({ type: String, example: '19.99' })
  price!: string;

  @ApiProperty({ type: String, nullable: true })
  compareAtPrice!: string | null;

  @ApiProperty({ type: Number })
  inventoryQuantity!: number;

  @ApiProperty({
    type: String,
    enum: ['DENY', 'CONTINUE'],
    example: 'DENY',
  })
  inventoryPolicy!: 'DENY' | 'CONTINUE';

  @ApiProperty({
    type: () => [ProductReviewSelectedOptionDto],
  })
  selectedOptions!: ProductReviewSelectedOptionDto[];
}

class ProductReviewVariantsDto {
  @ApiProperty({
    type: () => [ProductReviewVariantDto],
  })
  nodes!: ProductReviewVariantDto[];
}

class ProductReviewProductDto {
  @ApiProperty({ type: String })
  id!: string;

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

  @ApiProperty({ type: [String] })
  tags!: string[];

  @ApiProperty({
    type: String,
    enum: ['ACTIVE', 'ARCHIVED', 'DRAFT', 'UNLISTED'],
  })
  status!: ProductStatus;

  @ApiProperty({ type: String })
  createdAt!: string;

  @ApiProperty({ type: String })
  updatedAt!: string;

  @ApiProperty({ type: String, nullable: true })
  publishedAt!: string | null;

  @ApiProperty({ type: Number })
  totalInventory!: number;

  @ApiProperty({ type: () => ProductReviewSeoDto })
  seo!: ProductReviewSeoDto;

  @ApiProperty({
    type: () => ProductReviewFeaturedMediaDto,
    nullable: true,
  })
  featuredMedia!: ProductReviewFeaturedMediaDto | null;

  @ApiProperty({ type: String, nullable: true })
  onlineStoreUrl!: string | null;

  @ApiProperty({ type: String, nullable: true })
  onlineStorePreviewUrl!: string | null;

  @ApiProperty({ type: () => ProductReviewPriceRangeDto })
  priceRangeV2!: ProductReviewPriceRangeDto;

  @ApiProperty({ type: () => ProductReviewVariantsDto })
  variants!: ProductReviewVariantsDto;
}

class ProductReviewAISeoDto {
  @ApiProperty({
    type: String,
    nullable: true,
  })
  title!: string | null;

  @ApiProperty({
    type: String,
    nullable: true,
  })
  metaDescription!: string | null;
}

class ProductReviewAIInsightDto {
  @ApiProperty({ type: String })
  title!: string;

  @ApiProperty({ type: String })
  description!: string;

  @ApiProperty({
    type: String,
    enum: ['content', 'inventory', 'seo', 'pricing', 'product'],
  })
  category!: 'content' | 'inventory' | 'seo' | 'pricing' | 'product';

  @ApiProperty({
    type: String,
    enum: ['low', 'medium', 'high'],
  })
  priority!: 'low' | 'medium' | 'high';
}

export class ProductReviewAIReviewDto {
  @ApiProperty({ type: () => ProductReviewAISeoDto })
  seo!: ProductReviewAISeoDto;

  @ApiProperty({
    type: () => [ProductReviewAIInsightDto],
  })
  insights!: ProductReviewAIInsightDto[];
}

export class ProductReviewResponse implements ProductReviewResponseDto {
  @ApiProperty({ type: () => ProductReviewShopDto })
  shop!: ProductReviewResponseDto['shop'];

  @ApiProperty({ type: () => ProductReviewProductDto })
  product!: ShopifyProductNode;

  @ApiProperty({ type: () => ProductReviewAIReviewDto })
  aiReview!: ProductAIReview;
}
