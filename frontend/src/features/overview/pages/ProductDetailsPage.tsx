import { useEffect } from 'react';
import {
  ArrowLeft,
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

import { ProductDetailsSkeleton } from '../components/ProductDetailsSkeleton';

import { useProduct } from '../hooks/getProduct';
import type { ElementType, ReactNode } from 'react';

export function GetProductDetailsPage() {
  const { productId } = useParams();
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant',
    });
  }, [productId]);

  const { data, isPending, isError } = useProduct(productId!);

  if (isPending) {
    return <ProductDetailsSkeleton />;
  }
  if (isError || !data) {
    window.history.back();
    return;
  }

  const { product, aiReview } = data;
  const aiInsights = aiReview.insights;
  const price = product.priceRangeV2.minVariantPrice;
  const maxPrice = product.priceRangeV2.maxVariantPrice;
  const inventoryPercentage = Math.min(
    (product.totalInventory / 50) * 100,
    100,
  );
  const productUrl =
    data.product.onlineStoreUrl ??
    `${data.shop.primaryDomain?.url}/products/${data.product.handle}`;

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

        <Button variant="link" size="sm" className="min-h-9 cursor-pointer">
          <a href={productUrl} className="flex w-fit items-center">
            <ExternalLink className="mr-2 h-4 w-4 shrink-0" />
            View in Shopify
          </a>
        </Button>
      </nav>

      <section className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
        <div className="flex min-w-0 items-start gap-3 sm:gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border bg-muted/40 sm:h-16 sm:w-16 sm:rounded-2xl">
            <Package className="h-6 w-6 text-muted-foreground sm:h-8 sm:w-8" />
          </div>

          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/10 dark:text-emerald-400">
                {product.status}
              </Badge>

              <Badge variant="outline" className="p-2.5">
                {product.productType}
              </Badge>
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
          value={formatPrice(price.amount, price.currencyCode)}
          description={
            price.amount === maxPrice.amount
              ? 'Single price across variants'
              : `Up to ${formatPrice(maxPrice.amount, maxPrice.currencyCode)}`
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
          value={String(product.variants.nodes.length)}
          description="Product variants"
          icon={Package}
          detail={
            <div className="space-y-1.5">
              {product.variants.nodes.slice(0, 3).map((variant) => (
                <div
                  key={variant.id}
                  className="flex items-center justify-between gap-2 text-xs"
                >
                  <span className="min-w-0 truncate text-muted-foreground">
                    {variant.title}
                  </span>
                  <span className="shrink-0 font-medium">
                    {formatPrice(variant.price, price.currencyCode)}
                  </span>
                </div>
              ))}

              {product.variants.nodes.length > 3 && (
                <p className="text-xs text-muted-foreground">
                  +{product.variants.nodes.length - 3} more variants
                </p>
              )}

              {product.variants.nodes.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  No variants available
                </p>
              )}
            </div>
          }
        />

        <MetricCard
          label="AI insights"
          value={String(aiInsights.length)}
          description="Suggested improvements"
          icon={Sparkles}
          detail={
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">High / Medium / Low</span>
              <span className="font-medium">
                {(['high', 'medium', 'low'] as const)
                  .map((p) => aiInsights.filter((i) => i.priority === p).length)
                  .join(' / ')}
              </span>
            </div>
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
                A quick summary of this product and its main opportunities.
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 px-4 pb-4 sm:px-6 sm:pb-6">
          <p className="text-sm leading-6 text-muted-foreground sm:leading-7">
            <strong className="text-foreground">{product.title}</strong> has
            &#32;
            {product.totalInventory} units in inventory. The following
            recommendations are based on the current AI review.
          </p>

          <div className="grid gap-2 sm:grid-cols-3 sm:gap-3">
            {aiReview.insights.slice(0, 3).map((insight, index) => {
              const Icon = iconMap[insight.category];

              return (
                <BriefingItem
                  key={`${insight.category}-${index}`}
                  icon={Icon}
                  title={insight.title}
                  text={truncateText(insight.description, 90)}
                  iconClass={colorMap[insight.category]}
                />
              );
            })}
          </div>
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

              <InfoRow label="Vendor">{product.vendor}</InfoRow>
              <InfoRow label="Product type">{product.productType}</InfoRow>
              <InfoRow label="Created">
                {formatSmartUSDate(product.createdAt)}
              </InfoRow>
              <InfoRow label="Last updated">
                {formatSmartUSDate(product.updatedAt)}
              </InfoRow>
              <Separator />

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Description</h3>

                <p className="text-sm leading-6 text-muted-foreground">
                  {product.description}
                </p>
              </div>

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
                <strong className="text-foreground">{product.title}</strong> has
                &#32;
                {product.variants.nodes.length} variants with &#32;
                {product.totalInventory} units available across all options.
              </p>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Variants</p>
                  <p className="mt-1 text-lg font-semibold">
                    {product.variants.nodes.length}
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
                    {formatPrice(
                      product.priceRangeV2.minVariantPrice.amount,
                      product.priceRangeV2.minVariantPrice.currencyCode,
                    )}
                    {' – '}
                    {formatPrice(
                      product.priceRangeV2.maxVariantPrice.amount,
                      product.priceRangeV2.maxVariantPrice.currencyCode,
                    )}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                {product.variants.nodes.map((variant) => {
                  const isOutOfStock = variant.inventoryQuantity <= 0;
                  const isLowStock =
                    variant.inventoryQuantity > 0 &&
                    variant.inventoryQuantity <= 5;

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
                          {variant.selectedOptions
                            .map((option) => `${option.name}: ${option.value}`)
                            .join(' · ')}
                        </p>
                      </div>

                      <div className="shrink-0 text-right">
                        <p className="text-sm font-semibold">
                          {formatPrice(
                            variant.price,
                            product.priceRangeV2.minVariantPrice.currencyCode,
                          )}
                        </p>

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
                  Suggested SEO title
                </p>
                <p className="break-words text-sm font-medium">
                  {aiReview.seo.title || 'No title suggestion available'}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">
                  Suggested meta description
                </p>
                <p className="break-words text-sm leading-6 text-muted-foreground">
                  {aiReview.seo.metaDescription ||
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

                <Badge variant="secondary">{aiInsights.length}</Badge>
              </div>

              <p className="text-sm text-muted-foreground">
                Suggested improvements for this product.
              </p>
            </CardHeader>

            <CardContent className="space-y-4 px-4 pb-4 sm:space-y-5 sm:px-6 sm:pb-6">
              {aiInsights.map((insight, index) => {
                const Icon = iconMap[insight.category];

                return (
                  <div key={insight.title} className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
                        <Icon
                          className={`h-4 w-4 ${colorMap[insight.category]}`}
                        />
                      </div>

                      <div className="min-w-0 flex-1 space-y-2">
                        <p className="text-sm font-medium leading-5">
                          {insight.title}
                        </p>

                        <p className="text-sm leading-6 text-muted-foreground">
                          {insight.description}
                        </p>

                        <Badge
                          variant="outline"
                          className="max-w-full whitespace-normal"
                        >
                          {insight.category} · {insight.priority}
                        </Badge>
                      </div>
                    </div>

                    {index < aiInsights.length - 1 && <Separator />}
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

function BriefingItem({
  icon: Icon,
  title,
  text,
  iconClass,
}: {
  icon: ElementType;
  title: string;
  text: string;
  iconClass: string;
}) {
  return (
    <div className="flex items-start gap-2.5 rounded-lg border p-3 sm:p-4">
      <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${iconClass}`} />

      <div className="min-w-0 space-y-1">
        <p className="text-sm font-medium">{title}</p>

        <p className="text-sm leading-5 text-muted-foreground">{text}</p>
      </div>
    </div>
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
