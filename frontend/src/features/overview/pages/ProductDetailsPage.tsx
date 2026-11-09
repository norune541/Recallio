import { useEffect } from 'react';
import type { ElementType, ReactNode } from 'react';
import {
  ArrowLeft,
  Check,
  ExternalLink,
  Lightbulb,
  Package,
  Sparkles,
  Tag,
  Warehouse,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useParams } from 'react-router-dom';

import { formatSmartUSDate } from '@/common/utils/formatDate';
import { formatPrice } from '@/common/utils/formatPrice';
import { truncateText } from '@/common/utils/truncateText';
import { iconMap, colorMap } from '@/common/utils/icons';

import { ProductDetailsSkeleton } from '../skeletons/ProductDetailsSkeleton';

import { useProduct } from '../hooks/getProduct';

export function GetProductDetailsPage() {
  const { productId } = useParams();
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant',
    });
  }, [productId]);

  const { data: product, isPending, isError } = useProduct(productId!);

  if (isPending) {
    return <ProductDetailsSkeleton />;
  }
  if (isError || !product) {
    window.history.back();
    return null;
  }

  const review = product.productReview;
  const insights = review?.insights ?? [];

  const minPrice = String(product.minVariantPrice);
  const maxPrice = String(product.maxVariantPrice);
  const currency = product.minVariantCurrency;
  const hasSinglePrice = product.minVariantPrice === product.maxVariantPrice;

  const inventoryPercentage = Math.min(
    (product.totalInventory / 50) * 100,
    100,
  );

  const isActive = product.status === 'ACTIVE';

  const productUrl = product.onlineStorePreviewUrl;

  return (
    <div className="mx-auto w-full min-w-0 max-w-[1440px] space-y-5 pb-8 sm:space-y-7 sm:pb-10">
      <nav className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button
          variant="link"
          className="-ml-3 min-h-9 w-auto text-muted-foreground cursor-pointer"
          onClick={() => window.history.back()}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go back
        </Button>

        {productUrl && (
          <Button variant="link" size="sm" className="min-h-9 cursor-pointer">
            <a
              href={productUrl}
              target="_blank"
              rel="noreferrer"
              className="flex w-fit items-center"
            >
              <ExternalLink className="mr-2 h-4 w-4 shrink-0" />
              View in Shopify
            </a>
          </Button>
        )}
      </nav>

      <section className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
        <div className="flex min-w-0 items-start gap-3 sm:gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border bg-muted/40 sm:h-16 sm:w-16 sm:rounded-2xl">
            {product.featuredImageUrl ? (
              <img
                src={product.featuredImageUrl}
                alt={product.featuredImageAltText || product.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <Package className="h-6 w-6 text-muted-foreground sm:h-8 sm:w-8" />
            )}
          </div>

          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant={isActive ? 'default' : 'secondary'}
                className={
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/10 dark:text-emerald-400'
                    : undefined
                }
              >
                {product.status}
              </Badge>

              {product.productType && (
                <Badge variant="outline" className="p-2.5">
                  {product.productType}
                </Badge>
              )}
            </div>

            <h1 className="break-words text-xl font-semibold tracking-tight sm:text-2xl lg:text-3xl">
              {product.title}
            </h1>

            <p className="break-words text-sm leading-5 text-muted-foreground">
              {product.vendor}

              <span className="mx-1.5">·</span>

              {product.handle}
            </p>

            <p className="text-xs text-muted-foreground">
              Updated {formatSmartUSDate(product.updatedAt)}
            </p>
          </div>
        </div>
      </section>

      <Separator />

      <section
        aria-label="Product metrics"
        className="grid grid-cols-2 gap-2 sm:gap-4 xl:grid-cols-4"
      >
        <MetricCard
          label="Current price"
          value={formatPrice(minPrice, currency)}
          description={
            hasSinglePrice
              ? 'Single price across variants'
              : `Up to ${formatPrice(maxPrice, product.maxVariantCurrency)}`
          }
          icon={Tag}
          detail="Lowest variant price"
        />

        <MetricCard
          label="Inventory"
          value={`${product.totalInventory} units`}
          description="Across all variants"
          icon={Warehouse}
          detail={
            <div className="space-y-1.5">
              <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-foreground"
                  style={{ width: `${inventoryPercentage}%` }}
                />
              </div>

              <p className="text-xs text-muted-foreground">
                Total inventory across product variants
              </p>
            </div>
          }
        />

        <MetricCard
          label="Variants"
          value={String(product.variants.length)}
          description="Product variants"
          icon={Package}
          detail={
            <div className="space-y-1.5">
              {product.variants.slice(0, 3).map((variant) => (
                <div
                  key={variant.id}
                  className="flex items-center justify-between gap-2 text-xs"
                >
                  <span className="min-w-0 truncate text-muted-foreground">
                    {variant.title}
                  </span>
                  <span className="shrink-0 font-medium">
                    {formatPrice(variant.price, currency)}
                  </span>
                </div>
              ))}

              {product.variants.length > 3 && (
                <p className="text-xs text-muted-foreground">
                  +{product.variants.length - 3} more variants
                </p>
              )}

              {product.variants.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  No variants available
                </p>
              )}
            </div>
          }
        />

        <MetricCard
          label="AI review"
          value={String(insights.length)}
          description="Insights highlighted"
          icon={Sparkles}
          detail={
            <p className="text-xs text-muted-foreground">
              {insights.length > 0
                ? truncateText(insights[0].description, 100)
                : 'No AI review available yet'}
            </p>
          }
        />
      </section>

      <Card className="min-w-0 overflow-hidden border-primary/20">
        <div className="h-1 bg-primary/70" />

        <CardHeader className="p-4 sm:p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 sm:h-10 sm:w-10">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>

            <div className="min-w-0 flex-1 space-y-1">
              <CardTitle className="text-base sm:text-lg">
                Recallio AI briefing
              </CardTitle>

              <p className="text-sm text-muted-foreground">
                A quick summary of this product and its main strengths.
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 px-4 pb-4 sm:px-6 sm:pb-6">
          <p className="text-sm leading-6 text-muted-foreground sm:leading-7">
            <strong className="text-foreground">{product.title}</strong> has{' '}
            {product.totalInventory} units in inventory.{' '}
            {insights.length > 0
              ? `The AI review identified ${insights.length} product insights.`
              : 'The AI review for this product is not ready yet.'}
          </p>

          {insights.length > 0 && (
            <div className="grid gap-2 sm:grid-cols-3 sm:gap-3">
              {insights.slice(0, 3).map((insight, index) => {
                const Icon =
                  iconMap[insight.category as keyof typeof iconMap] ?? Package;

                const color =
                  colorMap[insight.category as keyof typeof colorMap] ??
                  'text-primary';

                return (
                  <div
                    key={`${insight.title}-${index}`}
                    className="flex min-w-0 items-start gap-2 rounded-lg bg-muted/50 p-3"
                  >
                    <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${color}`} />

                    <p className="min-w-0 text-sm font-medium">
                      {insight.title}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid min-w-0 items-start gap-5 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:gap-6">
        <div className="min-w-0 space-y-5 sm:space-y-6">
          <Card className="min-w-0">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-base">Product information</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4 px-4 pb-4 sm:space-y-5 sm:px-6 sm:pb-6">
              <InfoRow label="Product ID">
                <span className="break-all font-mono text-xs">
                  {product.id}
                </span>
              </InfoRow>

              <InfoRow label="Shopify ID">
                <span className="break-all font-mono text-xs">
                  {product.shopifyProductId}
                </span>
              </InfoRow>

              <InfoRow label="Vendor">{product.vendor}</InfoRow>
              <InfoRow label="Product type">{product.productType}</InfoRow>
              <InfoRow label="Created">
                {formatSmartUSDate(product.createdAt)}
              </InfoRow>
              {product.publishedAt && (
                <InfoRow label="Published">
                  {formatSmartUSDate(product.publishedAt)}
                </InfoRow>
              )}
              <InfoRow label="Last updated">
                {formatSmartUSDate(product.updatedAt)}
              </InfoRow>
              <InfoRow label="Last synced">
                {formatSmartUSDate(product.syncedAt)}
              </InfoRow>
              <Separator />

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Description</h3>

                <p className="text-sm leading-6 text-muted-foreground">
                  {product.description || 'No description available'}
                </p>
              </div>

              {product.tags.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Tags</h3>

                  <div className="flex flex-wrap gap-2">
                    {product.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="min-w-0">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-base">Product variants</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Overview of product options, pricing and availability.
              </p>
            </CardHeader>

            <CardContent className="space-y-4 px-4 pb-4 sm:px-6 sm:pb-6">
              <p className="text-sm leading-6 text-muted-foreground">
                <strong className="text-foreground">{product.title}</strong> has{' '}
                {product.variants.length} variants with {product.totalInventory}{' '}
                units available across all options.
              </p>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Variants</p>
                  <p className="mt-1 text-lg font-semibold">
                    {product.variants.length}
                  </p>
                </div>

                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Total stock</p>
                  <p className="mt-1 text-lg font-semibold">
                    {product.totalInventory}
                  </p>
                </div>

                <div className="col-span-2 rounded-lg border p-3 sm:col-span-1">
                  <p className="text-xs text-muted-foreground">Price range</p>
                  <p className="mt-1 text-lg font-semibold">
                    {formatPrice(minPrice, currency)}
                    {!hasSinglePrice && (
                      <>
                        {' – '}
                        {formatPrice(maxPrice, product.maxVariantCurrency)}
                      </>
                    )}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                {product.variants.map((variant) => {
                  const isOutOfStock = variant.inventoryQuantity <= 0;
                  const isLowStock =
                    variant.inventoryQuantity > 0 &&
                    variant.inventoryQuantity <= 5;

                  const hasDiscount =
                    !!variant.compareAtPrice &&
                    Number(variant.compareAtPrice) > Number(variant.price);

                  const borderColor = isOutOfStock
                    ? 'border-red-500'
                    : isLowStock
                      ? 'border-orange-500'
                      : 'border-[#908fff]';

                  const textColor = isOutOfStock
                    ? 'text-red-600'
                    : isLowStock
                      ? 'text-orange-600'
                      : 'text-[#908fff]';

                  const backgroundColor = isOutOfStock
                    ? 'bg-red-500/1'
                    : isLowStock
                      ? 'bg-orange-500/1'
                      : 'bg-[#908fff]/1';

                  const variantOptions = Array.isArray(variant.selectedOptions)
                    ? variant.selectedOptions
                    : [];

                  return (
                    <div
                      key={variant.id}
                      className={`flex items-center justify-between gap-3 rounded-lg border p-3 ${borderColor} ${backgroundColor}`}
                    >
                      <div className="min-w-0 space-y-1">
                        <p className="truncate text-sm font-medium">
                          {variant.title}
                        </p>

                        <p className="text-xs text-muted-foreground">
                          {variantOptions.length > 0
                            ? variantOptions
                                .map(
                                  (option) => `${option.name}: ${option.value}`,
                                )
                                .join(' · ')
                            : 'No options selected'}
                        </p>

                        {variant.sku && (
                          <p className="truncate font-mono text-xs text-muted-foreground">
                            SKU: {variant.sku}
                          </p>
                        )}
                      </div>

                      <div className="shrink-0 text-right">
                        <p className="text-sm font-semibold">
                          {formatPrice(variant.price, currency)}
                        </p>

                        {hasDiscount && (
                          <p className="text-xs text-muted-foreground line-through">
                            {formatPrice(variant.compareAtPrice!, currency)}
                          </p>
                        )}

                        <p className={`text-xs font-medium ${textColor}`}>
                          {isOutOfStock
                            ? 'Out of stock'
                            : `${variant.inventoryQuantity} in stock`}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="min-w-0">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-base">AI SEO suggestions</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Suggested improvements to help your product perform better in
                search results.
              </p>
            </CardHeader>

            <CardContent className="space-y-4 px-4 pb-4 sm:px-6 sm:pb-6">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">
                  Current SEO title
                </p>
                <p className="break-words text-sm text-muted-foreground">
                  {product.seoTitle || 'Not set'}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">
                  Suggested SEO title
                </p>
                <p className="break-words text-sm font-medium">
                  {review?.seoTitle || 'No title suggestion available'}
                </p>
              </div>

              <Separator />

              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">
                  Current meta description
                </p>
                <p className="break-words text-sm leading-6 text-muted-foreground">
                  {product.seoDescription || 'Not set'}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">
                  Suggested meta description
                </p>
                <p className="break-words text-sm leading-6 text-muted-foreground">
                  {review?.seoMetaDescription ||
                    'No meta description suggestion available'}
                </p>
              </div>

              <Button variant="outline" className="min-h-10 w-full">
                <Sparkles className="mr-2 h-4 w-4" />
                Improve SEO with AI
              </Button>
            </CardContent>
          </Card>
        </div>

        <aside className="min-w-0 space-y-5 sm:space-y-6">
          <Card className="min-w-0">
            <CardHeader className="p-4 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <CardTitle className="text-base">AI insights</CardTitle>

                <Badge variant="secondary">{insights.length}</Badge>
              </div>

              <p className="text-sm text-muted-foreground">
                Insights highlighted in the AI review.
              </p>
            </CardHeader>

            <CardContent className="space-y-4 px-4 pb-4 sm:space-y-5 sm:px-6 sm:pb-6">
              {insights.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No insights available yet.
                </p>
              )}

              {insights.map((insight, index) => {
                const Icon =
                  iconMap[insight.category as keyof typeof iconMap] ?? Package;

                const color =
                  colorMap[insight.category as keyof typeof colorMap] ??
                  'text-primary';

                return (
                  <div key={`${insight.title}-${index}`} className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
                        <Icon className={`h-5 w-5 ${color}`} />
                      </div>

                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-medium">{insight.title}</p>
                          <Badge variant="outline">{insight.category}</Badge>
                          <Badge variant="secondary">{insight.priority}</Badge>
                        </div>

                        <p className="text-sm leading-6 text-muted-foreground">
                          {insight.description}
                        </p>
                      </div>
                    </div>

                    {index < insights.length - 1 && <Separator />}
                  </div>
                );
              })}

              <Button variant="outline" className="min-h-10 w-full">
                <Lightbulb className="mr-2 h-4 w-4" />
                Explore all insights
              </Button>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  description,
  icon: Icon,
  detail,
}: {
  label: string;
  value: string;
  description: string;
  icon: ElementType;
  detail: ReactNode;
}) {
  return (
    <Card className="min-w-0 transition-shadow hover:shadow-md">
      <CardContent className="p-3.5 sm:p-5">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground sm:text-sm">{label}</p>

          <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
        </div>

        <div className="mt-2 space-y-1 sm:mt-3">
          <p className="break-words text-xl font-semibold tracking-tight sm:text-2xl">
            {value}
          </p>

          <p className="text-xs leading-5 text-muted-foreground">
            {description}
          </p>
        </div>

        <div className="mt-3 min-w-0 sm:mt-4">{detail}</div>
      </CardContent>
    </Card>
  );
}

function InfoRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid min-w-0 gap-1.5 sm:grid-cols-[140px_minmax(0,1fr)] sm:gap-4">
      <p className="text-sm text-muted-foreground">{label}</p>

      <div className="min-w-0 text-sm">{children}</div>
    </div>
  );
}
