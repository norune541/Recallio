type ProductStatus = 'ACTIVE' | 'ARCHIVED' | 'DRAFT' | 'UNLISTED';

type Money = {
  amount: string;
  currencyCode: string;
};

type ProductImage = {
  url: string;
  altText: string | null;
  width: number | null;
  height: number | null;
};

type ProductVariant = {
  id: string;
  title: string;
  sku: string | null;
  barcode: string | null;
  price: string;
  compareAtPrice: string | null;
  inventoryQuantity: number;
  inventoryPolicy: 'DENY' | 'CONTINUE';
  selectedOptions: {
    name: string;
    value: string;
  }[];
};

export type ShopifyProductNode = {
  // Identification
  id: string;
  title: string;
  handle: string;
  description: string;
  descriptionHtml: string;
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

  // SEO
  seo: {
    title: string | null;
    description: string | null;
  };

  // Media
  featuredMedia: {
    preview: {
      image: ProductImage | null;
    } | null;
  } | null;

  // Storefront links
  onlineStoreUrl: string | null;
  onlineStorePreviewUrl: string | null;

  // Pricing
  priceRangeV2: {
    minVariantPrice: Money;
    maxVariantPrice: Money;
  };

  // Variants
  variants: {
    nodes: ProductVariant[];
  };
};
