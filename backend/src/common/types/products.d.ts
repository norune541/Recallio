type ProductStatus = 'ACTIVE' | 'ARCHIVED' | 'DRAFT' | 'UNLISTED';
type Money = { amount: string; currencyCode: string };
type ProductImage = {
  url: string;
  altText: string | null;
  width: number | null;
  height: number | null;
};

export type ShopifyProductNode = {
  // Identification
  id: string;
  title: string;
  handle: string;
  vendor: string;
  productType: string;
  tags: string[];

  // Status and dates
  status: ProductStatus;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;

  // Inventory
  totalInventory: number;

  // Media
  featuredMedia: { preview: { image: ProductImage | null } | null } | null;

  // Storefront links
  onlineStoreUrl: string | null;
  onlineStorePreviewUrl: string | null;

  // Pricing
  priceRangeV2: {
    minVariantPrice: Money;
    maxVariantPrice: Money;
  };
};
