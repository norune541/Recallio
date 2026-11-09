import {
  AlertTriangle,
  ArrowRight,
  ChevronRight,
  Lightbulb,
  MessageSquareText,
  MoreHorizontal,
  Package,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Search,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

import { useShopify } from '@/common/hooks/getShopify';
import { useProducts } from '../hooks/getProducts';
import { useSyncShopify } from '../hooks/useSyncShopify';

import { ProductIntelligence } from '../components/ProductIntelligence';
import { ShopNotConnectedMainComponent } from '@/components/ShopNotConnectedMainComponent';
import { OverviewSkeleton } from '../skeletons/OverviewSkeleton';
import { OverviewKpiCards } from '../components/OverviewKpiCards';
import { OverviewIntelligenceBriefing } from '../components/OverviewBriefingComponent';

import { truncateText } from '@/common/utils/truncateText';

const activityItems = [
  {
    icon: Sparkles,
    iconStyle: 'bg-violet-100 text-violet-700',
    title: 'AI identified a product opportunity',
    description:
      'Customers frequently ask about bundle discounts for the Water Bottle.',
    time: '12 min ago',
  },
  {
    icon: AlertTriangle,
    iconStyle: 'bg-amber-100 text-amber-700',
    title: 'Low inventory detected',
    description: 'Everyday Ceramic Mug has only 8 units remaining.',
    time: '38 min ago',
  },
  {
    icon: MessageSquareText,
    iconStyle: 'bg-sky-100 text-sky-700',
    title: 'New conversation insights available',
    description: 'AI analyzed recurring questions about shipping and delivery.',
    time: '1 hour ago',
  },
];

const weeklyActivity = [
  { day: 'Mon', value: 38 },
  { day: 'Tue', value: 58 },
  { day: 'Wed', value: 46 },
  { day: 'Thu', value: 75 },
  { day: 'Fri', value: 62 },
  { day: 'Sat', value: 88 },
  { day: 'Sun', value: 69 },
];

type Insight = {
  category: 'content' | 'seo' | 'inventory' | 'pricing' | 'product';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
};

function isInsight(value: unknown): value is Insight {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const insight = value as Record<string, unknown>;

  return (
    typeof insight.title === 'string' &&
    typeof insight.description === 'string' &&
    ['content', 'seo', 'inventory', 'pricing', 'product'].includes(
      insight.category as string,
    ) &&
    ['high', 'medium', 'low'].includes(insight.priority as string)
  );
}

export function OverviewPage() {
  const {
    syncStatus,
    isSyncing,
    isSyncError,
    isLoading: isSyncLoading,
  } = useSyncShopify();

  const {
    isPending: isShopifyPending,
    isError: isShopifyError,
    error: shopifyError,
  } = useShopify();

  const {
    data,
    isPending: isProductsPending,
    isError: isProductsError,
    error: productsError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useProducts();

  const isShopNotFound =
    isShopifyError &&
    shopifyError &&
    typeof shopifyError === 'object' &&
    'code' in shopifyError &&
    shopifyError.code === 'SHOP_NOT_FOUND';

  if (isShopNotFound) {
    return <ShopNotConnectedMainComponent />;
  }

  if (isSyncLoading || isSyncing || isShopifyPending || isProductsPending) {
    return <OverviewSkeleton />;
  }

  const products = data?.items ?? [];

  const insights = products.flatMap((product) => {
    const rawInsights = product.productReview?.insights;

    if (!Array.isArray(rawInsights)) {
      return [];
    }

    return rawInsights.filter(isInsight);
  });

  const categoryConfig = {
    content: {
      icon: MessageSquareText,
      className: 'bg-sky-100 text-sky-700',
    },
    seo: {
      icon: Search,
      className: 'bg-violet-100 text-violet-700',
    },
    inventory: {
      icon: Package,
      className: 'bg-amber-100 text-amber-700',
    },
    pricing: {
      icon: Lightbulb,
      className: 'bg-emerald-100 text-emerald-700',
    },
    product: {
      icon: Lightbulb,
      className: 'bg-violet-100 text-violet-700',
    },
  };

  const priorityConfig = {
    high: 'bg-amber-500',
    medium: 'bg-violet-500',
    low: 'bg-emerald-500',
  };

  return (
    <div className="space-y-8 pb-8">
      {/* PAGE HEADER */}

      <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Workspace</span>
            <ChevronRight className="size-3.5 text-muted-foreground" />
            <span className="text-sm font-medium">Overview</span>
          </div>

          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Store overview
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Your store performance, customer signals, and AI-powered insights —
            all in one place.
          </p>
        </div>
      </section>

      {/* SYNC STATUS */}

      {isSyncError && (
        <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
          <AlertTriangle className="mt-0.5 size-5 shrink-0 text-destructive" />

          <div>
            <p className="text-sm font-medium">
              Shopify synchronization failed
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              We couldn't synchronize your store products. Please try again.
            </p>
          </div>
        </div>
      )}

      {/* PRODUCTS ERROR */}

      {isProductsError && (
        <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
          <AlertTriangle className="mt-0.5 size-5 shrink-0 text-destructive" />

          <div>
            <p className="text-sm font-medium">Failed to load products</p>

            <p className="mt-1 text-sm text-muted-foreground">
              {productsError instanceof Error
                ? productsError.message
                : 'Something went wrong while loading your products.'}
            </p>
          </div>
        </div>
      )}

      <OverviewKpiCards />

      <OverviewIntelligenceBriefing products={data?.items ?? []} />

      <section className="grid gap-4 xl:grid-cols-5">
        <Card className="xl:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <Badge className="mb-4">IN DEVELOPMENT</Badge>

              <CardTitle className="text-base">Customer activity</CardTitle>

              <p className="mt-1 text-sm text-muted-foreground">
                Conversations processed by AI
              </p>
            </div>

            <Button
              variant="ghost"
              size="icon"
              aria-label="Customer activity options"
              onClick={() =>
                console.log('[Recallio] Customer activity options')
              }
            >
              <MoreHorizontal className="size-4" />
            </Button>
          </CardHeader>

          <CardContent className="pt-4">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-3xl font-semibold tracking-tight">842</p>

                <p className="mt-1 flex items-center gap-1 text-sm text-emerald-600">
                  <TrendingUp className="size-4" />
                  18.6% more than last period
                </p>
              </div>

              <Badge variant="outline" className="font-normal">
                Last 7 days
              </Badge>
            </div>

            <div
              className="mt-8 grid h-44 grid-cols-7 items-end gap-3"
              aria-label="Illustrative weekly customer activity chart"
            >
              {weeklyActivity.map((item) => (
                <div
                  key={item.day}
                  className="flex h-full flex-col items-center justify-end gap-2"
                >
                  <div className="flex w-full flex-1 items-end">
                    <div
                      className="w-full rounded-t-md bg-primary/15 transition-colors hover:bg-primary/40"
                      style={{ height: `${item.value}%` }}
                      title={`${item.value} relative activity`}
                    />
                  </div>

                  <span className="text-xs text-muted-foreground">
                    {item.day}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-5 flex items-center gap-2 border-t pt-4">
              <div className="size-2 rounded-full bg-primary" />

              <p className="text-xs text-muted-foreground">
                Illustrative activity data · Not connected to live analytics
              </p>
            </div>
          </CardContent>
        </Card>

        {/* PRIORITY ACTIONS */}

        <Card className="xl:col-span-2">
          <CardHeader className="pb-3">
            <Badge className="mb-4">IN DEVELOPMENT</Badge>

            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-base">Priority actions</CardTitle>

              <Badge variant="secondary">{insights.length} items</Badge>
            </div>

            <p className="text-sm text-muted-foreground">
              Issues and opportunities identified by AI
            </p>
          </CardHeader>

          <CardContent className="space-y-1">
            {insights.length > 0 ? (
              insights.slice(0, 3).map((insight, index) => {
                const config = categoryConfig[insight.category];
                const Icon = config.icon;

                return (
                  <button
                    key={`${insight.category}-${index}`}
                    type="button"
                    className="group flex w-full items-start gap-3 rounded-lg p-3 text-left transition-colors hover:bg-muted/60"
                    onClick={() =>
                      console.log('[Recallio] Review insight', insight)
                    }
                  >
                    <div
                      className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${config.className}`}
                    >
                      <Icon className="size-4" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">
                          {truncateText(insight.title, 65)}
                        </p>

                        <span
                          className={`size-1.5 shrink-0 rounded-full ${priorityConfig[insight.priority]}`}
                        />
                      </div>

                      <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        {truncateText(insight.description, 120)}
                      </p>
                    </div>

                    <ChevronRight className="mt-1 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                  </button>
                );
              })
            ) : (
              <div className="py-8 text-center">
                <p className="text-sm font-medium">No priority actions yet</p>

                <p className="mt-1 text-xs text-muted-foreground">
                  AI insights will appear here after product analysis.
                </p>
              </div>
            )}

            <Button
              variant="outline"
              className="mt-3 w-full gap-2"
              onClick={() =>
                console.log('[Recallio] View all priority actions')
              }
              disabled={!insights.length}
            >
              View all insights
              <ArrowRight className="size-4" />
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* PRODUCT INTELLIGENCE */}

      <ProductIntelligence />

      {/* RECENT ACTIVITY + AI COVERAGE */}

      <section className="grid gap-4 lg:grid-cols-2">
        {/* RECENT ACTIVITY */}

        <Card>
          <CardHeader>
            <Badge>IN DEVELOPMENT</Badge>

            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-base">Recent activity</CardTitle>

              <Button
                variant="ghost"
                size="sm"
                className="gap-1"
                onClick={() => console.log('[Recallio] View activity history')}
              >
                View all
                <ArrowRight className="size-3.5" />
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            <div className="space-y-5">
              {activityItems.map((item, index) => {
                const Icon = item.icon;

                return (
                  <div key={item.title} className="flex gap-3">
                    <div
                      className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${item.iconStyle}`}
                    >
                      <Icon className="size-4" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{item.title}</p>

                      <p className="mt-1 text-sm leading-5 text-muted-foreground">
                        {item.description}
                      </p>

                      <p className="mt-2 text-xs text-muted-foreground">
                        {item.time}
                      </p>
                    </div>

                    {index === 0 && (
                      <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* AI COVERAGE */}

        <Card>
          <CardHeader>
            <Badge>IN DEVELOPMENT</Badge>

            <div className="flex items-center gap-2">
              <div className="flex size-9 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
                <BrainCircuitIcon />
              </div>

              <div>
                <CardTitle className="text-base">AI coverage</CardTitle>

                <p className="mt-1 text-sm text-muted-foreground">
                  How intelligence is being applied
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-5">
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm">Conversation analysis</span>

                <span className="text-sm font-medium">86%</span>
              </div>

              <div
                className="h-2 overflow-hidden rounded-full bg-muted"
                role="progressbar"
                aria-label="Conversation analysis"
                aria-valuenow={86}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  className="h-full rounded-full bg-violet-500"
                  style={{ width: '86%' }}
                />
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm">Product insight coverage</span>

                <span className="text-sm font-medium">72%</span>
              </div>

              <div
                className="h-2 overflow-hidden rounded-full bg-muted"
                role="progressbar"
                aria-label="Product insight coverage"
                aria-valuenow={72}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  className="h-full rounded-full bg-sky-500"
                  style={{ width: '72%' }}
                />
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm">Support trend detection</span>

                <span className="text-sm font-medium">64%</span>
              </div>

              <div
                className="h-2 overflow-hidden rounded-full bg-muted"
                role="progressbar"
                aria-label="Support trend detection"
                aria-valuenow={64}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  className="h-full rounded-full bg-emerald-500"
                  style={{ width: '64%' }}
                />
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-xl border p-3">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-muted-foreground" />

              <p className="text-xs leading-5 text-muted-foreground">
                AI coverage metrics are examples for the UI. Production values
                should come from actual processing records and defined coverage
                criteria.
              </p>
            </div>

            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={() => console.log('[Recallio] Open AI configuration')}
            >
              <Sparkles className="size-4" />
              Explore AI capabilities
              <ArrowRight className="ml-auto size-4" />
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* PAGINATION */}

      {hasNextPage && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage ? 'Loading...' : 'Load more products'}
          </Button>
        </div>
      )}
    </div>
  );
}

function BrainCircuitIcon() {
  return <Sparkles className="size-4" />;
}
