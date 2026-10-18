import { useState } from 'react';
import { useAuth } from '@clerk/react';
import { toast } from 'sonner';

import {
  Activity,
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  ChevronRight,
  Clock3,
  CloudDownload,
  Lightbulb,
  MessageSquareText,
  MoreHorizontal,
  Package,
  RefreshCw,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  TrendingUp,
  Zap,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { Badge } from '@/components/ui/badge';

import { Button } from '@/components/ui/button';

// ============================================================
// Backend configuration
// ============================================================

// Set VITE_API_URL to your backend URL in the frontend .env file.
// Example: VITE_API_URL=https://your-backend.up.railway.app
//
// Replace the endpoint below with the actual route registered
// for your Shopify products controller.

const API_BASE_URL = 'http://localhost:3000';
const PRODUCTS_ENDPOINT = '/api/integrations/shopify/products';

// ============================================================
// Demo data
// Replace with live API data as your backend integration grows.
// ============================================================

const stats = [
  {
    label: 'Products synced',
    value: '1,284',
    change: '+12 this week',
    trend: 'up',
    icon: Package,
    description: 'Across your catalog',
  },
  {
    label: 'Conversations analyzed',
    value: '842',
    change: '+18.6%',
    trend: 'up',
    icon: MessageSquareText,
    description: 'AI-analyzed in 30 days',
  },
  {
    label: 'AI-assisted resolution',
    value: '68%',
    change: '+5.2%',
    trend: 'up',
    icon: Sparkles,
    description: 'Of analyzed conversations',
  },
  {
    label: 'Insights to review',
    value: '14',
    change: '3 high priority',
    trend: 'attention',
    icon: AlertTriangle,
    description: 'Across products and support',
  },
];

const initialProducts = [
  {
    id: '1',
    title: 'Everyday Ceramic Mug',
    category: 'Drinkware',
    price: 24,
    inventory: 8,
    unitsSold: 128,
    status: 'Low stock',
    accent: 'bg-orange-50 text-orange-700',
    initial: 'M',
    insight: 'Frequently mentioned in gift-related conversations.',
    insightType: 'opportunity',
  },
  {
    id: '2',
    title: 'Everyday Water Bottle',
    category: 'Accessories',
    price: 28,
    inventory: 146,
    unitsSold: 214,
    status: 'In stock',
    accent: 'bg-sky-50 text-sky-700',
    initial: 'W',
    insight: 'Customers often ask about bundle discounts.',
    insightType: 'opportunity',
  },
  {
    id: '3',
    title: 'Minimal Desk Lamp',
    category: 'Home & Living',
    price: 89,
    inventory: 32,
    unitsSold: 42,
    status: 'In stock',
    accent: 'bg-violet-50 text-violet-700',
    initial: 'L',
    insight: 'Shipping concerns appear in recent feedback.',
    insightType: 'attention',
  },
  {
    id: '4',
    title: 'Classic Linen Tote',
    category: 'Accessories',
    price: 32,
    inventory: 74,
    unitsSold: 96,
    status: 'In stock',
    accent: 'bg-emerald-50 text-emerald-700',
    initial: 'T',
    insight: 'Positive feedback about material quality.',
    insightType: 'positive',
  },
];

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

// ============================================================
// Main component
// ============================================================

export function OverviewPage() {
  const { getToken } = useAuth();

  const [loadingProducts, setLoadingProducts] = useState(false);
  const [products] = useState(initialProducts);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = products.filter((product) =>
    product.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // ----------------------------------------------------------
  // Backend controller test
  // ----------------------------------------------------------

  const handleFetchProducts = async () => {
    setLoadingProducts(true);

    console.groupCollapsed('[Recallio] Fetch Shopify products');

    try {
      const token = await getToken();

      console.log('Request URL:', `${API_BASE_URL}${PRODUCTS_ENDPOINT}`);
      console.log('Sending request to backend...');

      const response = await fetch(`${API_BASE_URL}${PRODUCTS_ENDPOINT}`, {
        method: 'GET',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          Accept: 'application/json',
        },
      });

      const responseText = await response.text();

      let result: unknown;

      try {
        result = responseText ? JSON.parse(responseText) : null;
      } catch {
        result = responseText;
      }

      console.log('HTTP status:', response.status);
      console.log('Response body:', result);

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      console.log('Products request completed successfully.');

      toast.success('Products fetched successfully', {
        description: 'Check the browser console for the response.',
      });
    } catch (error) {
      console.error('[Recallio] Products request failed:', error);

      toast.error('Could not fetch products', {
        description:
          error instanceof Error
            ? error.message
            : 'An unexpected error occurred.',
      });
    } finally {
      console.groupEnd();
      setLoadingProducts(false);
    }
  };

  return (
    <div className="space-y-8 pb-8">
      {/* ======================================================
          PAGE HEADER
      ====================================================== */}

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

        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant="outline"
            className="h-8 gap-2 rounded-lg px-3 font-normal"
          >
            <span className="size-2 rounded-full bg-emerald-500" />
            Demo data
          </Badge>

          <Button
            variant="outline"
            className="gap-2"
            onClick={handleFetchProducts}
            disabled={loadingProducts}
          >
            {loadingProducts ? (
              <RefreshCw className="size-4 animate-spin" />
            ) : (
              <CloudDownload className="size-4" />
            )}

            {loadingProducts
              ? 'Fetching products...'
              : 'Fetch Shopify products'}
          </Button>
        </div>
      </section>

      {/* ======================================================
          STORE STATUS
      ====================================================== */}

      <Card className="border-dashed shadow-none">
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted">
              <ShoppingBag className="size-5 text-muted-foreground" />
            </div>

            <div>
              <p className="text-sm font-medium">Shopify workspace</p>

              <p className="mt-1 text-sm text-muted-foreground">
                Sample metrics are displayed. Fetch your store's products to
                test the backend connection.
              </p>
            </div>
          </div>

          <Badge variant="secondary" className="w-fit gap-1.5">
            <Activity className="size-3.5" />
            Development mode
          </Badge>
        </CardContent>
      </Card>

      {/* ======================================================
          KPI CARDS
      ====================================================== */}

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold">At a glance</h2>

          <span className="text-xs text-muted-foreground">
            Illustrative sample metrics
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <Card
                key={stat.label}
                className="transition-shadow hover:shadow-md"
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">
                        {stat.label}
                      </p>

                      <p className="text-3xl font-semibold tracking-tight">
                        {stat.value}
                      </p>
                    </div>

                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted">
                      <Icon className="size-5 text-foreground" />
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    {stat.trend === 'attention' ? (
                      <Badge variant="secondary" className="gap-1 font-normal">
                        <AlertTriangle className="size-3" />
                        {stat.change}
                      </Badge>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
                        <ArrowUpRight className="size-3.5" />
                        {stat.change}
                      </span>
                    )}

                    <span className="text-xs text-muted-foreground">
                      {stat.description}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* ======================================================
          AI INSIGHTS
      ====================================================== */}

      <section>
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="size-5" />
            <h2 className="text-base font-semibold">Intelligence briefing</h2>
          </div>

          <Badge variant="secondary" className="gap-1.5 font-normal">
            <Zap className="size-3.5" />
            AI generated
          </Badge>
        </div>

        <Card className="overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-violet-500 via-indigo-500 to-sky-500" />

          <CardContent className="p-5 sm:p-6">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
                <Sparkles className="size-6" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
                  <div>
                    <h3 className="text-lg font-semibold tracking-tight">
                      Here's what deserves your attention
                    </h3>

                    <p className="mt-1 text-sm text-muted-foreground">
                      A sample summary of signals across your store.
                    </p>
                  </div>

                  <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock3 className="size-3.5" />
                    Sample briefing
                  </span>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-3">
                  <div className="rounded-xl border p-4">
                    <div className="mb-3 flex items-center gap-2 text-amber-600">
                      <AlertTriangle className="size-4" />
                      <span className="text-xs font-medium uppercase tracking-wide">
                        Needs attention
                      </span>
                    </div>

                    <p className="text-sm font-semibold">
                      Low stock on Ceramic Mug
                    </p>

                    <p className="mt-1.5 text-sm leading-5 text-muted-foreground">
                      Inventory is down to 8 units. Review restocking before
                      demand exceeds available supply.
                    </p>
                  </div>

                  <div className="rounded-xl border p-4">
                    <div className="mb-3 flex items-center gap-2 text-violet-600">
                      <Lightbulb className="size-4" />
                      <span className="text-xs font-medium uppercase tracking-wide">
                        Opportunity
                      </span>
                    </div>

                    <p className="text-sm font-semibold">
                      Explore product bundles
                    </p>

                    <p className="mt-1.5 text-sm leading-5 text-muted-foreground">
                      Customers frequently ask about discounts on multiple
                      items. A bundle offer may address that demand.
                    </p>
                  </div>

                  <div className="rounded-xl border p-4">
                    <div className="mb-3 flex items-center gap-2 text-emerald-600">
                      <CheckCircle2 className="size-4" />
                      <span className="text-xs font-medium uppercase tracking-wide">
                        Customer signal
                      </span>
                    </div>

                    <p className="text-sm font-semibold">
                      Material quality is a strength
                    </p>

                    <p className="mt-1.5 text-sm leading-5 text-muted-foreground">
                      Positive feedback about the Linen Tote's material could
                      help inform product messaging.
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex flex-col justify-between gap-3 border-t pt-4 sm:flex-row sm:items-center">
                  <p className="text-xs leading-5 text-muted-foreground">
                    Sample insights for demonstration. Live insights should be
                    grounded in actual store and conversation data.
                  </p>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-fit gap-2"
                    onClick={() =>
                      console.log('[Recallio] Open AI insights:', {
                        source: 'overview',
                      })
                    }
                  >
                    Explore insights
                    <ArrowRight className="size-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* ======================================================
          ANALYTICS + ATTENTION
      ====================================================== */}

      <section className="grid gap-4 xl:grid-cols-5">
        {/* Weekly activity */}

        <Card className="xl:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
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

            {/* Lightweight chart without a charting dependency */}

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

        {/* Priority actions */}

        <Card className="xl:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-base">Priority actions</CardTitle>

              <Badge variant="secondary">3 items</Badge>
            </div>

            <p className="text-sm text-muted-foreground">
              Issues and opportunities identified by AI
            </p>
          </CardHeader>

          <CardContent className="space-y-1">
            <button
              type="button"
              className="group flex w-full items-start gap-3 rounded-lg p-3 text-left transition-colors hover:bg-muted/60"
              onClick={() =>
                console.log('[Recallio] Review low inventory', {
                  productId: '1',
                  product: 'Everyday Ceramic Mug',
                })
              }
            >
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                <Package className="size-4" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">Review low inventory</p>
                  <span className="size-1.5 shrink-0 rounded-full bg-amber-500" />
                </div>

                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  Everyday Ceramic Mug · 8 units remaining
                </p>
              </div>

              <ChevronRight className="mt-1 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
            </button>

            <button
              type="button"
              className="group flex w-full items-start gap-3 rounded-lg p-3 text-left transition-colors hover:bg-muted/60"
              onClick={() =>
                console.log('[Recallio] Review recurring questions', {
                  topic: 'shipping',
                })
              }
            >
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-sky-100 text-sky-700">
                <MessageSquareText className="size-4" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">
                  Review recurring questions
                </p>

                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  Customers have repeated shipping questions.
                </p>
              </div>

              <ChevronRight className="mt-1 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
            </button>

            <button
              type="button"
              className="group flex w-full items-start gap-3 rounded-lg p-3 text-left transition-colors hover:bg-muted/60"
              onClick={() =>
                console.log('[Recallio] Review bundle opportunity', {
                  productId: '2',
                })
              }
            >
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-violet-700">
                <Lightbulb className="size-4" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">
                  Explore bundle opportunities
                </p>

                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  Interest in multi-item discounts.
                </p>
              </div>

              <ChevronRight className="mt-1 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
            </button>

            <Button
              variant="outline"
              className="mt-3 w-full gap-2"
              onClick={() =>
                console.log('[Recallio] View all priority actions')
              }
            >
              View all insights
              <ArrowRight className="size-4" />
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* ======================================================
          PRODUCT CATALOG
      ====================================================== */}

      <section>
        <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold">Product intelligence</h2>

              <Badge variant="secondary" className="font-normal">
                AI enriched
              </Badge>
            </div>

            <p className="mt-1 text-sm text-muted-foreground">
              Product signals and recommendations, not just catalog data.
            </p>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="w-fit gap-2"
            onClick={() => console.log('[Recallio] View full product catalog')}
          >
            View catalog
            <ArrowRight className="size-4" />
          </Button>
        </div>

        <Card>
          <CardContent className="p-0">
            {/* Product table toolbar */}

            <div className="flex flex-col justify-between gap-3 border-b p-4 sm:flex-row sm:items-center">
              <div className="relative w-full sm:max-w-xs">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                <input
                  type="text"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search products..."
                  aria-label="Search products"
                  className="h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm outline-none transition-shadow placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="size-2 rounded-full bg-emerald-500" />
                Sample catalog · {filteredProducts.length} products shown
              </div>
            </div>

            {/* Responsive product list */}

            <div className="divide-y">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="grid gap-4 p-4 transition-colors hover:bg-muted/30 md:grid-cols-[minmax(0,1.5fr)_100px_100px_minmax(0,1.5fr)_32px] md:items-center"
                >
                  {/* Product */}

                  <div className="flex min-w-0 items-center gap-3">
                    <div
                      className={`flex size-11 shrink-0 items-center justify-center rounded-xl text-sm font-semibold ${product.accent}`}
                    >
                      {product.initial}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {product.title}
                      </p>

                      <p className="mt-1 text-xs text-muted-foreground">
                        {product.category}
                      </p>
                    </div>
                  </div>

                  {/* Price */}

                  <div>
                    <p className="text-xs text-muted-foreground md:hidden">
                      Price
                    </p>

                    <p className="text-sm font-medium">
                      ${product.price.toFixed(2)}
                    </p>
                  </div>

                  {/* Inventory */}

                  <div>
                    <p className="text-xs text-muted-foreground md:hidden">
                      Inventory
                    </p>

                    <p
                      className={`text-sm font-medium ${
                        product.inventory < 10 ? 'text-amber-600' : ''
                      }`}
                    >
                      {product.inventory} units
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      {product.status}
                    </p>
                  </div>

                  {/* AI insight */}

                  <div className="min-w-0 rounded-lg bg-muted/50 p-3">
                    <div className="mb-1.5 flex items-center gap-1.5">
                      {product.insightType === 'attention' ? (
                        <AlertTriangle className="size-3.5 shrink-0 text-amber-600" />
                      ) : product.insightType === 'positive' ? (
                        <CheckCircle2 className="size-3.5 shrink-0 text-emerald-600" />
                      ) : (
                        <Sparkles className="size-3.5 shrink-0 text-violet-600" />
                      )}

                      <span className="text-xs font-medium">AI insight</span>
                    </div>

                    <p className="text-xs leading-5 text-muted-foreground">
                      {product.insight}
                    </p>
                  </div>

                  {/* Row action */}

                  <div className="flex justify-end">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`View ${product.title}`}
                      onClick={() =>
                        console.log('[Recallio] Open product', product)
                      }
                    >
                      <ChevronRight className="size-4" />
                    </Button>
                  </div>
                </div>
              ))}

              {filteredProducts.length === 0 && (
                <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
                  <Package className="size-8 text-muted-foreground" />

                  <p className="mt-3 text-sm font-medium">No products found</p>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Try a different search term.
                  </p>
                </div>
              )}
            </div>

            <div className="flex flex-col justify-between gap-2 border-t bg-muted/20 px-4 py-3 sm:flex-row sm:items-center">
              <p className="text-xs text-muted-foreground">
                AI recommendations shown here are illustrative demo content.
              </p>

              <Button
                variant="ghost"
                size="sm"
                className="w-fit gap-2"
                onClick={handleFetchProducts}
                disabled={loadingProducts}
              >
                <RefreshCw
                  className={`size-3.5 ${
                    loadingProducts ? 'animate-spin' : ''
                  }`}
                />
                Refresh from Shopify
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* ======================================================
          RECENT ACTIVITY
      ====================================================== */}

      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
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

        {/* AI coverage */}

        <Card>
          <CardHeader>
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
    </div>
  );
}

// Small local icon component to keep the dashboard independent
// of an additional icon or charting library.

function BrainCircuitIcon() {
  return <Sparkles className="size-4" />;
}
