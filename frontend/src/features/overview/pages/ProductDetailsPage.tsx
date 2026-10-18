import type { ElementType, ReactNode } from 'react';
import {
  ArrowLeft,
  Check,
  ChevronRight,
  CircleAlert,
  Clock,
  ExternalLink,
  Eye,
  Lightbulb,
  Package,
  Pencil,
  Sparkles,
  Tag,
  TrendingUp,
  WandSparkles,
  Warehouse,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

const product = {
  id: 'gid://shopify/Product/8432074293311',
  title: 'The Complete Snowboard',
  vendor: 'Snowboard Co.',
  productType: 'Snowboards',
  status: 'ACTIVE',
  sku: 'SB-COMP-001',
  price: 699,
  compareAtPrice: 849,
  currency: 'USD',
  inventory: 24,
  variants: 4,
  createdAt: 'October 2, 2026',
  updatedAt: 'October 15, 2026',
  description:
    'The Complete Snowboard is designed for riders who want confidence on every run. Built with a lightweight core, responsive flex, and a durable base, it delivers reliable performance across a wide range of mountain conditions.',
  variantsList: [
    {
      name: '155 cm',
      sku: 'SB-COMP-155',
      price: 699,
      inventory: 8,
      available: true,
    },
    {
      name: '158 cm',
      sku: 'SB-COMP-158',
      price: 699,
      inventory: 12,
      available: true,
    },
    {
      name: '161 cm',
      sku: 'SB-COMP-161',
      price: 699,
      inventory: 4,
      available: true,
    },
    {
      name: '164 cm',
      sku: 'SB-COMP-164',
      price: 699,
      inventory: 0,
      available: false,
    },
  ],
  tags: ['snowboard', 'winter', 'all-mountain', 'bestseller'],
  seo: {
    title: 'The Complete Snowboard | Snowboard Co.',
    description:
      'Shop the Complete Snowboard. Built for reliable performance and confidence on every run.',
  },
};

const aiInsights = [
  {
    type: 'opportunity',
    title: 'Improve the product description',
    description:
      'The description explains the general benefits, but lacks concrete specifications. Adding details about the core material, flex rating, and recommended rider level could help customers make a more informed decision.',
    impact: 'Content quality',
    icon: WandSparkles,
  },
  {
    type: 'warning',
    title: 'One variant is out of stock',
    description:
      'The 164 cm variant currently has zero units available. If this size is important to your customers, consider reviewing your replenishment plans.',
    impact: 'Inventory',
    icon: Warehouse,
  },
  {
    type: 'opportunity',
    title: 'Review your SEO metadata',
    description:
      'Your SEO title includes the product name and brand. Consider testing a more descriptive title that reflects the product’s main characteristics.',
    impact: 'SEO',
    icon: Eye,
  },
];

const recentActivity = [
  {
    action: 'Product updated',
    description: 'Product description changed',
    date: 'Oct 15, 2026 · 2:34 PM',
  },
  {
    action: 'Inventory updated',
    description: 'Stock level changed to 24 units',
    date: 'Oct 14, 2026 · 11:12 AM',
  },
  {
    action: 'Product created',
    description: 'Product added to your Shopify catalog',
    date: 'Oct 2, 2026 · 9:45 AM',
  },
];

function formatPrice(price: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: product.currency,
    maximumFractionDigits: 2,
  }).format(price);
}

export function GetProductDetailsPage() {
  const inventoryPercentage = Math.min((product.inventory / 50) * 100, 100);
  const variantsInStock = product.variantsList.filter(
    (variant) => variant.inventory > 0,
  ).length;
  const outOfStockVariants = product.variantsList.filter(
    (variant) => !variant.available,
  ).length;

  return (
    <div className="mx-auto w-full min-w-0 max-w-[1440px] space-y-5 pb-8 sm:space-y-7 sm:pb-10">
      <nav className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button
          variant="ghost"
          className="-ml-3 min-h-10 w-fit text-muted-foreground"
          onClick={() => window.history.back()}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to products
        </Button>

        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <Badge variant="outline" className="gap-1.5 font-normal">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Synced with Shopify
          </Badge>
          <Button variant="outline" size="sm" className="min-h-9">
            <ExternalLink className="mr-2 h-4 w-4" />
            View in Shopify
          </Button>
        </div>
      </nav>

      <section className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
        <div className="flex min-w-0 items-start gap-3 sm:gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border bg-muted/40 sm:h-16 sm:w-16 sm:rounded-2xl">
            <Package className="h-6 w-6 text-muted-foreground sm:h-8 sm:w-8" />
          </div>

          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/10 dark:text-emerald-400">
                Active
              </Badge>
              <Badge variant="outline">{product.productType}</Badge>
            </div>
            <h1 className="break-words text-xl font-semibold tracking-tight sm:text-2xl lg:text-3xl">
              {product.title}
            </h1>
            <p className="break-words text-sm leading-5 text-muted-foreground">
              {product.vendor}
              <span className="mx-1.5">·</span>
              SKU {product.sku}
            </p>
            <p className="text-xs text-muted-foreground">
              Updated {product.updatedAt}
            </p>
          </div>
        </div>

        <div className="grid w-full grid-cols-2 gap-2 sm:w-auto sm:flex sm:shrink-0">
          <Button variant="outline" className="min-h-10 px-3">
            <Pencil className="mr-2 h-4 w-4" />
            Edit product
          </Button>
          <Button className="min-h-10 px-3">
            <Sparkles className="mr-2 h-4 w-4" />
            Analyze with AI
          </Button>
        </div>
      </section>

      <Separator />

      <section
        aria-label="Product metrics"
        className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4"
      >
        <MetricCard
          label="Current price"
          value={formatPrice(product.price)}
          description={`Compare-at: ${formatPrice(product.compareAtPrice)}`}
          icon={Tag}
          detail={
            <Badge className="whitespace-normal bg-emerald-500/10 text-xs text-emerald-700 hover:bg-emerald-500/10 dark:text-emerald-400">
              {Math.round((1 - product.price / product.compareAtPrice) * 100)}%
              below compare-at
            </Badge>
          }
        />
        <MetricCard
          label="Inventory"
          value={`${product.inventory} units`}
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
                {variantsInStock} of {product.variants} in stock
              </p>
            </div>
          }
        />
        <MetricCard
          label="Variants"
          value={String(product.variants)}
          description="Sizes or options"
          icon={Package}
          detail={
            <p className="text-xs text-muted-foreground">
              {outOfStockVariants} out of stock
            </p>
          }
        />
        <MetricCard
          label="AI insights"
          value={String(aiInsights.length)}
          description="Suggested improvements"
          icon={Sparkles}
          detail={
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              Demo analysis
            </span>
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
            <Badge variant="outline" className="shrink-0">
              Demo
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 px-4 pb-4 sm:px-6 sm:pb-6">
          <p className="text-sm leading-6 text-muted-foreground sm:leading-7">
            <strong className="text-foreground">{product.title}</strong> is
            active with {product.variants} variants and {product.inventory}{' '}
            units in stock. One size is unavailable. The clearest opportunities
            are adding specific product details and reviewing the SEO metadata.
          </p>
          <div className="grid gap-2 sm:grid-cols-3 sm:gap-3">
            <BriefingItem
              icon={CircleAlert}
              title="Inventory"
              text="One variant is out of stock."
              iconClass="text-amber-500"
            />
            <BriefingItem
              icon={WandSparkles}
              title="Content"
              text="Add concrete product specifications."
              iconClass="text-primary"
            />
            <BriefingItem
              icon={TrendingUp}
              title="SEO"
              text="Review the title and meta description."
              iconClass="text-emerald-600"
            />
          </div>
          <p className="text-xs leading-5 text-muted-foreground">
            Illustrative recommendations based on mock data, not verified sales
            predictions.
          </p>
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
              <InfoRow label="Created">{product.createdAt}</InfoRow>
              <InfoRow label="Last updated">{product.updatedAt}</InfoRow>
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
            <CardHeader className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <div>
                <CardTitle className="text-base">Product variants</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  Pricing and availability by size
                </p>
              </div>
              <Badge variant="secondary" className="w-fit">
                {product.variantsList.length} variants
              </Badge>
            </CardHeader>
            <CardContent className="px-4 pb-4 sm:px-6 sm:pb-6">
              {/* Mobile: stacked cards avoid horizontal scrolling and tiny table columns. */}
              <div className="space-y-3 md:hidden">
                {product.variantsList.map((variant) => (
                  <div key={variant.sku} className="rounded-xl border p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-medium">{variant.name}</p>
                        <p className="mt-1 break-all font-mono text-xs text-muted-foreground">
                          {variant.sku}
                        </p>
                      </div>
                      {variant.available ? (
                        <Badge className="shrink-0 bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/10 dark:text-emerald-400">
                          In stock
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="shrink-0">
                          Out of stock
                        </Badge>
                      )}
                    </div>
                    <Separator className="my-3" />
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span className="text-muted-foreground">Price</span>
                      <span className="font-medium">
                        {formatPrice(variant.price)}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-3 text-sm">
                      <span className="text-muted-foreground">Stock</span>
                      <span
                        className={
                          variant.inventory === 0
                            ? 'font-medium text-destructive'
                            : 'font-medium'
                        }
                      >
                        {variant.inventory} units
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Tablet/desktop: use a table when there is enough horizontal space. */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[560px] text-sm">
                  <thead>
                    <tr className="border-b text-left text-xs text-muted-foreground">
                      <th className="pb-3 pr-4 font-medium">Variant</th>
                      <th className="pb-3 pr-4 font-medium">SKU</th>
                      <th className="pb-3 pr-4 font-medium">Price</th>
                      <th className="pb-3 pr-4 font-medium">Stock</th>
                      <th className="pb-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {product.variantsList.map((variant) => (
                      <tr key={variant.sku} className="border-b last:border-0">
                        <td className="py-4 pr-4 font-medium">
                          {variant.name}
                        </td>
                        <td className="break-all py-4 pr-4 font-mono text-xs text-muted-foreground">
                          {variant.sku}
                        </td>
                        <td className="whitespace-nowrap py-4 pr-4">
                          {formatPrice(variant.price)}
                        </td>
                        <td className="py-4 pr-4">{variant.inventory}</td>
                        <td className="py-4">
                          {variant.available ? (
                            <Badge className="bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/10 dark:text-emerald-400">
                              In stock
                            </Badge>
                          ) : (
                            <Badge variant="destructive">Out of stock</Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card className="min-w-0">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-base">Search engine preview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 px-4 pb-4 sm:px-6 sm:pb-6">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">SEO title</p>
                <p className="break-words text-sm font-medium">
                  {product.seo.title}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">
                  Meta description
                </p>
                <p className="break-words text-sm leading-6 text-muted-foreground">
                  {product.seo.description}
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
                const Icon = insight.icon;
                return (
                  <div key={insight.title} className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                        <Icon className="h-4 w-4" />
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
                          {insight.impact}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="-ml-3 min-h-9 whitespace-normal text-left"
                        >
                          Review recommendation
                          <ChevronRight className="ml-1 h-4 w-4 shrink-0" />
                        </Button>
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

          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-base">Product activity</CardTitle>
              <p className="text-sm text-muted-foreground">
                Recent changes to this product.
              </p>
            </CardHeader>
            <CardContent className="px-4 pb-4 sm:px-6 sm:pb-6">
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={activity.action} className="relative flex gap-3">
                    <div className="relative flex shrink-0 flex-col items-center">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full border bg-background">
                        {index === 0 ? (
                          <Pencil className="h-3.5 w-3.5" />
                        ) : index === 1 ? (
                          <Package className="h-3.5 w-3.5" />
                        ) : (
                          <Check className="h-3.5 w-3.5" />
                        )}
                      </div>
                      {index < recentActivity.length - 1 && (
                        <div className="absolute top-8 h-10 w-px bg-border" />
                      )}
                    </div>
                    <div className="min-w-0 space-y-1 pb-2">
                      <p className="text-sm font-medium">{activity.action}</p>
                      <p className="text-sm leading-5 text-muted-foreground">
                        {activity.description}
                      </p>
                      <p className="text-xs leading-5 text-muted-foreground">
                        {activity.date}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-start gap-3 p-4 sm:p-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10">
                <Check className="h-5 w-5 text-emerald-600" />
              </div>
              <div className="min-w-0 space-y-1">
                <p className="text-sm font-medium">Shopify integration</p>
                <p className="text-sm leading-6 text-muted-foreground">
                  This product belongs to your connected Shopify store.
                </p>
                <p className="text-xs text-muted-foreground">
                  Last synced: Oct 17, 2026
                </p>
              </div>
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
    <Card className="min-w-0">
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
