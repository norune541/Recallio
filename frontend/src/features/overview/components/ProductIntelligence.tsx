import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Package,
  ChevronRight,
  Search,
  ArrowRight,
  FilterIcon,
} from 'lucide-react';

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

import { formatPrice } from '@/common/utils/formatPrice';
import { iconMap, colorMap } from '@/common/utils/icons';
import { truncateText } from '@/common/utils/truncateText';

import { ProductIntellegenceSkeleton } from '../skeletons/CatalogSkeleton';

type Insight = {
  title: string;
  description: string;
  category: keyof typeof iconMap;
};

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

function ProductInsight({ insight }: { insight: Insight }) {
  const Icon = iconMap[insight.category];

  return (
    <div className="min-w-0 rounded-lg bg-muted/50 p-3">
      <div className="mb-1.5 flex items-center gap-1.5">
        <Icon className={`size-3.5 shrink-0 ${colorMap[insight.category]}`} />

        <span className="truncate text-xs font-medium">{insight.title}</span>
      </div>

      <p className="text-xs leading-5 text-muted-foreground">
        {truncateText(insight.description)}
      </p>
    </div>
  );
}

export function ProductIntelligence() {
  return (
    <section>
      <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h2 className="text-base font-semibold">Product intelligence</h2>

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

  if (isPending) {
    <ProductIntellegenceSkeleton />;
  }

  if (isError) {
    return <div className="p-4 text-sm text-destructive">{error.message}</div>;
  }

  const products = data?.pages.flatMap((page) => page.items) ?? [];

  const productTypes = [
    ...new Set(
      products.map((p) => p.productType).filter((t): t is string => !!t),
    ),
  ];

  const query = search.trim().toLowerCase();

  const filteredProducts = products.filter(
    (p) =>
      (selectedType === 'All types' || p.productType === selectedType) &&
      [p.title, p.vendor, p.handle].some((s) =>
        s.toLowerCase().includes(query),
      ),
  );

  return (
    <Card>
      <CardContent className="p-0">
        <div className="flex flex-col justify-between gap-3 border-b p-4 sm:flex-row sm:items-center">
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

              <input
                type="text"
                placeholder="Search products..."
                aria-label="Search products"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="!h-9 box-border w-full rounded-md border border-input bg-background px-3 pl-9 text-sm"
              />
            </div>

            <Select
              value={selectedType}
              onValueChange={(value) => setSelectedType(value ?? 'All types')}
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
            {filteredProducts.length === 1 ? ' product' : ' products'} shown
          </div>
        </div>

        <div className="divide-y">
          {filteredProducts.map((product, index) => {
            const insight = (
              product.productReview?.insights as Insight[] | undefined
            )?.[0];

            const avatarColor = avatarColors[index % avatarColors.length];

            const minPrice = formatPrice(
              product.minVariantPrice,
              product.minVariantCurrency,
            );
            const maxPrice = formatPrice(
              product.maxVariantPrice,
              product.maxVariantCurrency,
            );
            const price =
              minPrice === maxPrice ? minPrice : `${minPrice} – ${maxPrice}`;

            return (
              <Link
                key={product.id}
                to={`/products/${encodeURIComponent(product.id)}`}
                className="grid gap-4 p-4 transition-colors hover:bg-muted/30 md:grid-cols-[minmax(0,1.5fr)_100px_100px_minmax(0,1.5fr)_32px] md:items-center"
              >
                <div className="flex min-w-0 items-center gap-3">
                  {product.featuredImageUrl ? (
                    <img
                      src={product.featuredImageUrl}
                      alt={product.featuredImageAltText ?? product.title}
                      className="size-11 shrink-0 rounded-xl object-cover"
                    />
                  ) : (
                    <div
                      className={`flex size-11 shrink-0 items-center justify-center rounded-xl text-sm font-semibold ${avatarColor}`}
                    >
                      {product.title.charAt(0).toUpperCase()}
                    </div>
                  )}

                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {product.title}
                    </p>

                    <p className="mt-1 truncate text-xs text-muted-foreground">
                      {product.vendor || product.productType || 'Uncategorized'}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground md:hidden">
                    Price
                  </p>

                  <p className="text-sm font-medium">{price}</p>
                </div>

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

                  <p className="mt-1 text-xs lowercase text-muted-foreground first-letter:uppercase">
                    {product.status}
                  </p>
                </div>

                <div className="min-w-0">
                  {insight ? (
                    <ProductInsight insight={insight} />
                  ) : (
                    <div className="rounded-lg bg-muted/50 p-3">
                      <div className="mb-1.5 flex items-center gap-1.5">
                        <Sparkles className="size-3.5 shrink-0 text-muted-foreground" />

                        <span className="text-xs font-medium">AI insight</span>
                      </div>

                      <p className="text-xs leading-5 text-muted-foreground">
                        No product insights available yet.
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex justify-end">
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`View ${product.title}`}
                    tabIndex={-1}
                  >
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
              </Link>
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
