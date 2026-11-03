import { ApiProperty } from '@nestjs/swagger';

import type {
  ShopifyProductNode,
  ProductStatus,
} from 'backend/src/common/types/products.js';

import type { ProductAIReview } from '../../claude/dto/product-review.js';

export type ProductReviewResponseDto = {
  product: ShopifyProductNode;
  aiReview: ProductAIReview;
};

class ProductSeoDto {
  @ApiProperty({ type: String, nullable: true })
  title!: string | null;

  @ApiProperty({ type: String, nullable: true })
  description!: string | null;
}

class ProductImageDto {
  @ApiProperty({ type: String })
  url!: string;

  @ApiProperty({ type: String, nullable: true })
  altText!: string | null;

  @ApiProperty({ type: Number, nullable: true })
  width!: number | null;

  @ApiProperty({ type: Number, nullable: true })
  height!: number | null;
}

class ProductMediaPreviewDto {
  @ApiProperty({ type: () => ProductImageDto, nullable: true })
  image!: ProductImageDto | null;
}

class ProductFeaturedMediaDto {
  @ApiProperty({ type: () => ProductMediaPreviewDto, nullable: true })
  preview!: ProductMediaPreviewDto | null;
}

class MoneyDto {
  @ApiProperty({ type: String, example: '19.99' })
  amount!: string;

  @ApiProperty({ type: String, example: 'USD' })
  currencyCode!: string;
}

class PriceRangeDto {
  @ApiProperty({ type: () => MoneyDto })
  minVariantPrice!: MoneyDto;

  @ApiProperty({ type: () => MoneyDto })
  maxVariantPrice!: MoneyDto;
}

class SelectedOptionDto {
  @ApiProperty()
  name!: string;

  @ApiProperty()
  value!: string;
}

class ProductVariantDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  title!: string;

  @ApiProperty({ type: String, nullable: true })
  sku!: string | null;

  @ApiProperty({ type: String, nullable: true })
  barcode!: string | null;

  @ApiProperty({ example: '19.99' })
  price!: string;

  @ApiProperty({ type: String, nullable: true })
  compareAtPrice!: string | null;

  @ApiProperty({ type: Number })
  inventoryQuantity!: number;

  @ApiProperty()
  inventoryPolicy!: string;

  @ApiProperty({ type: () => [SelectedOptionDto] })
  selectedOptions!: SelectedOptionDto[];
}

class ProductVariantsDto {
  @ApiProperty({ type: () => [ProductVariantDto] })
  nodes!: ProductVariantDto[];
}

class ShopifyProductDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  title!: string;

  @ApiProperty()
  handle!: string;

  @ApiProperty()
  description!: string;

  @ApiProperty()
  descriptionHtml!: string;

  @ApiProperty()
  vendor!: string;

  @ApiProperty()
  productType!: string;

  @ApiProperty({ type: [String] })
  tags!: string[];

  @ApiProperty({ enum: ['ACTIVE', 'ARCHIVED', 'DRAFT'] })
  status!: ProductStatus;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;

  @ApiProperty({ type: String, nullable: true })
  publishedAt!: string | null;

  @ApiProperty()
  totalInventory!: number;

  @ApiProperty({ type: () => ProductSeoDto })
  seo!: ProductSeoDto;

  @ApiProperty({ type: () => ProductFeaturedMediaDto, nullable: true })
  featuredMedia!: ProductFeaturedMediaDto | null;

  @ApiProperty({ type: String, nullable: true })
  onlineStoreUrl!: string | null;

  @ApiProperty({ type: String, nullable: true })
  onlineStorePreviewUrl!: string | null;

  @ApiProperty({ type: () => PriceRangeDto })
  priceRangeV2!: PriceRangeDto;

  @ApiProperty({ type: () => ProductVariantsDto })
  variants!: ProductVariantsDto;
}

class AIReviewSeoDto {
  @ApiProperty({ type: String, nullable: true })
  title!: string | null;

  @ApiProperty({ type: String, nullable: true })
  metaDescription!: string | null;
}

class AIReviewInsightDto {
  @ApiProperty()
  title!: string;

  @ApiProperty()
  description!: string;

  @ApiProperty({
    enum: ['content', 'product', 'seo', 'inventory', 'pricing'],
  })
  category!: 'content' | 'product' | 'seo' | 'inventory' | 'pricing';

  @ApiProperty({ enum: ['low', 'medium', 'high'] })
  priority!: 'low' | 'medium' | 'high';
}

class ProductAIReviewDto {
  @ApiProperty({ type: () => AIReviewSeoDto })
  seo!: AIReviewSeoDto;

  @ApiProperty({ type: () => [AIReviewInsightDto] })
  insights!: AIReviewInsightDto[];
}

export class ProductReviewResponse implements ProductReviewResponseDto {
  @ApiProperty({ type: () => ShopifyProductDto })
  product!: ShopifyProductNode;

  @ApiProperty({ type: () => ProductAIReviewDto })
  aiReview!: ProductAIReview;
}
