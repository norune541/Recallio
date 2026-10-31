import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Sparkles,
  CheckCircle2,
  Package,
  ChevronRight,
  Search,
  ArrowRight,
  FilterIcon,
} from 'lucide-react';

import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { useProducts } from '../hooks/getProducts';
import type { components } from '@recallio/api-types';

type P = components['schemas'];

type Insight = {
  id: string;
  insight: string;
  insightType: 'opportunity' | 'attention' | 'positive';
};

const initialInsights: Insight[] = [
  {
    id: '1',
    insight: 'Frequently mentioned in gift-related conversations.',
    insightType: 'opportunity',
  },
  {
    id: '2',
    insight: 'Customers often ask about bundle discounts.',
    insightType: 'opportunity',
  },
  {
    id: '3',
    insight: 'Shipping concerns appear in recent feedback.',
    insightType: 'attention',
  },
  {
    id: '4',
    insight: 'Positive feedback about material quality.',
    insightType: 'positive',
  },
];

const avatarColors = [
  'bg-orange-100 text-orange-700',
  'bg-sky-100 text-sky-700',
  'bg-violet-100 text-violet-700',
  'bg-emerald-100 text-emerald-700',
  'bg-pink-100 text-pink-700',
  'bg-amber-100 text-amber-700',
  'bg-indigo-100 text-indigo-700',
  'bg-rose-100 text-rose-700',
];

function formatProductPrice(
  product: P['ShopifyProductsResponseDto']['items'][number],
) {
  const { minVariantPrice, maxVariantPrice } = product.priceRangeV2;

  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: minVariantPrice.currencyCode,
  });

  const min = Number(minVariantPrice.amount);
  const max = Number(maxVariantPrice.amount);

  if (min === max) {
    return formatter.format(min);
  }

  return `${formatter.format(min)} – ${formatter.format(max)}`;
}

export function ProductIntelligence() {
  return (
    <section>
      <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold">Product intelligence</h2>
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

      <CatalogComponent />
    </section>
  );
}

// Product catalog

export function CatalogComponent() {
  const [selectedType, setSelectedType] = useState('All types');
  const [search, setSearch] = useState('');

  const {
    data,
    isPending,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useProducts();

  const products = data?.pages.flatMap((page) => page.items ?? []) ?? [];

  const productTypes = useMemo(
    () => [
      ...new Set(
        products
          .map((product) => product.productType)
          .filter((type): type is string => Boolean(type)),
      ),
    ],
    [products],
  );

  const filteredProducts = products.filter((product) => {
    const matchesType =
      selectedType === 'All types' || product.productType === selectedType;

    const matchesSearch = product.title
      .toLowerCase()
      .includes(search.toLowerCase());

    return matchesType && matchesSearch;
  });

  if (isPending) {
    return (
      <Card>
        <CardContent className="p-0">
          {/* Toolbar skeleton */}
          <div className="flex flex-col justify-between gap-3 border-b p-4 sm:flex-row sm:items-center">
            <div className="flex flex-col gap-2 sm:flex-row">
              <Skeleton className="h-9 w-full sm:w-64" />
              <Skeleton className="h-9 w-full sm:w-[180px]" />
            </div>
            <Skeleton className="h-4 w-28" />
          </div>

          {/* Product rows skeleton */}
          <div className="divide-y">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="grid gap-4 p-4 md:grid-cols-[minmax(0,1.5fr)_100px_100px_minmax(0,1.5fr)_32px] md:items-center"
              >
                {/* Product */}
                <div className="flex items-center gap-3">
                  <Skeleton className="size-11 shrink-0 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>

                {/* Price */}
                <div className="space-y-2">
                  <Skeleton className="h-3 w-10 md:hidden" />
                  <Skeleton className="h-4 w-16" />
                </div>

                {/* Inventory */}
                <div className="space-y-2">
                  <Skeleton className="h-3 w-16 md:hidden" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-3 w-14" />
                </div>

                {/* AI insight */}
                <div className="space-y-2 rounded-lg bg-muted/50 p-3">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                </div>

                {/* Action */}
                <div className="flex justify-end">
                  <Skeleton className="size-8 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return <div className="p-4 text-sm text-destructive">{error.message}</div>;
  }

  return (
    <Card>
      <CardContent className="p-0">
        {/* Product table toolbar */}

        <div className="flex flex-col justify-between gap-3 border-b p-4 sm:flex-row sm:items-center">
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

              <input
                type="text"
                placeholder="Search products..."
                aria-label="Search products"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="!h-9 box-border w-full rounded-md border border-input bg-background px-3 pl-9 text-sm"
              />
            </div>

            <Select
              value={selectedType}
              onValueChange={(value) => setSelectedType(value ?? 'all')}
            >
              <SelectTrigger className="!h-9 box-border w-full sm:w-[180px]">
                <div className="flex items-center gap-2">
                  <FilterIcon className="size-4 text-muted-foreground" />
                  <SelectValue placeholder="Product type" />
                </div>
              </SelectTrigger>

              <SelectContent className="p-2">
                <SelectItem value="All types">All types</SelectItem>

                {productTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="size-2 rounded-full bg-emerald-500" />
            {filteredProducts.length}
            {filteredProducts.length === 1
              ? ' Product shown'
              : ' Products shown'}
          </div>
        </div>

        {/* Responsive product list */}

        <div className="divide-y">
          {filteredProducts.map((product, index) => {
            const insight = initialInsights[index % initialInsights.length];

            const avatarColor = avatarColors[index % avatarColors.length];

            return (
              <div
                key={product.id}
                className="grid gap-4 p-4 transition-colors hover:bg-muted/30 md:grid-cols-[minmax(0,1.5fr)_100px_100px_minmax(0,1.5fr)_32px] md:items-center"
              >
                {/* Product */}

                <div className="flex min-w-0 items-center gap-3">
                  <div
                    className={`flex size-11 shrink-0 items-center justify-center rounded-xl text-sm font-semibold ${avatarColor}`}
                  >
                    {product.title.charAt(0).toUpperCase()}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {product.title}
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      {product.productType}
                    </p>
                  </div>
                </div>

                {/* Price */}

                <div>
                  <p className="text-xs text-muted-foreground md:hidden">
                    Price
                  </p>

                  <p className="text-sm font-medium">
                    {formatProductPrice(product)}
                  </p>
                </div>

                {/* Inventory */}

                <div>
                  <p className="text-xs text-muted-foreground md:hidden">
                    Inventory
                  </p>

                  <p
                    className={`text-sm font-medium ${
                      product.totalInventory < 10 ? 'text-amber-600' : ''
                    }`}
                  >
                    {product.totalInventory} units
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    {product.status
                      .toLowerCase()
                      .split(' ')
                      .map(
                        (word) => word.charAt(0).toUpperCase() + word.slice(1),
                      )
                      .join(' ')}
                  </p>
                </div>

                {/* AI insight */}

                <div className="min-w-0 rounded-lg bg-muted/50 p-3">
                  <div className="mb-1.5 flex items-center gap-1.5">
                    {insight.insightType === 'attention' ? (
                      <AlertTriangle className="size-3.5 shrink-0 text-amber-600" />
                    ) : insight.insightType === 'positive' ? (
                      <CheckCircle2 className="size-3.5 shrink-0 text-emerald-600" />
                    ) : (
                      <Sparkles className="size-3.5 shrink-0 text-violet-600" />
                    )}

                    <span className="text-xs font-medium">AI insight</span>
                  </div>

                  <p className="text-xs leading-5 text-muted-foreground">
                    {insight.insight}
                  </p>
                </div>

                {/* Action */}

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
            );
          })}

          {filteredProducts.length === 0 && (
            <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
              <Package className="size-8 text-muted-foreground" />

              <p className="mt-3 text-sm font-medium">No products found</p>

              <p className="mt-1 text-sm text-muted-foreground">
                Try a different search term or product type.
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}

        {hasNextPage && (
          <div className="flex justify-center border-t p-4">
            <Button
              variant="outline"
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
            >
              {isFetchingNextPage ? 'Loading...' : 'Load more'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
