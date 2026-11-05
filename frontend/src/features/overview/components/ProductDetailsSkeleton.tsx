import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';

function MetricSkeleton() {
  return (
    <Card className="min-w-0">
      <CardContent className="p-3.5 sm:p-5">
        <div className="flex items-center justify-between gap-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="size-4 rounded" />
        </div>

        <div className="mt-2 space-y-2 sm:mt-3">
          <Skeleton className="h-7 w-28" />
          <Skeleton className="h-3 w-32" />
        </div>

        <div className="mt-3 space-y-2 sm:mt-4">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-2/3" />
        </div>
      </CardContent>
    </Card>
  );
}

function ProductInformationSkeleton() {
  return (
    <Card className="min-w-0">
      <CardHeader className="p-4 sm:p-6">
        <Skeleton className="h-5 w-36" />
      </CardHeader>

      <CardContent className="space-y-5 px-4 pb-4 sm:px-6 sm:pb-6">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="grid gap-2 sm:grid-cols-[140px_minmax(0,1fr)] sm:gap-4"
          >
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-full max-w-64" />
          </div>
        ))}

        <Separator />

        <div className="space-y-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>

        <div className="space-y-3">
          <Skeleton className="h-4 w-16" />
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-6 w-16 rounded-full" />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ProductVariantsSkeleton() {
  return (
    <Card className="min-w-0">
      <CardHeader className="p-4 sm:p-6">
        <Skeleton className="h-5 w-36" />
        <Skeleton className="mt-2 h-4 w-full max-w-72" />
      </CardHeader>

      <CardContent className="space-y-4 px-4 pb-4 sm:px-6 sm:pb-6">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="space-y-2 rounded-lg border p-3">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-6 w-20" />
            </div>
          ))}
        </div>

        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="flex items-center justify-between gap-3 rounded-lg border p-3"
            >
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-4 w-32 max-w-full" />
                <Skeleton className="h-3 w-24 max-w-full" />
              </div>

              <div className="shrink-0 space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function AiInsightsSkeleton() {
  return (
    <Card className="min-w-0">
      <CardHeader className="p-4 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-5 w-8 rounded-full" />
        </div>

        <Skeleton className="mt-2 h-4 w-full max-w-56" />
      </CardHeader>

      <CardContent className="space-y-5 px-4 pb-4 sm:px-6 sm:pb-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="space-y-3">
            <div className="flex items-start gap-3">
              <Skeleton className="mt-0.5 size-9 shrink-0 rounded-lg" />

              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-5/6" />
                <Skeleton className="h-5 w-24 rounded-full" />
              </div>
            </div>

            {index < 3 && <Separator />}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function ProductDetailsSkeleton() {
  return (
    <div className="mx-auto w-full min-w-0 max-w-[1440px] space-y-5 pb-8 sm:space-y-7 sm:pb-10">
      {/* Navigation */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-9 w-32" />
      </div>

      {/* Product header */}
      <section className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
        <div className="flex min-w-0 items-start gap-3 sm:gap-4">
          <Skeleton className="size-12 shrink-0 rounded-xl sm:size-16 sm:rounded-2xl" />

          <div className="min-w-0 flex-1 space-y-3">
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>

            <Skeleton className="h-7 w-64 max-w-full sm:h-8 lg:h-9" />
            <Skeleton className="h-4 w-48 max-w-full" />
            <Skeleton className="h-3 w-36" />
          </div>
        </div>
      </section>

      <Separator />

      {/* Metrics */}
      <section
        aria-label="Loading product metrics"
        className="grid grid-cols-2 gap-2 sm:gap-4 xl:grid-cols-4"
      >
        {Array.from({ length: 4 }).map((_, index) => (
          <MetricSkeleton key={index} />
        ))}
      </section>

      {/* AI briefing */}
      <Card className="min-w-0 overflow-hidden border-primary/20">
        <div className="h-1 bg-primary/20" />

        <CardHeader className="p-4 sm:p-6">
          <div className="flex items-start gap-3">
            <Skeleton className="size-10 shrink-0 rounded-xl" />

            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-full max-w-80" />
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 px-4 pb-4 sm:px-6 sm:pb-6">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />

          <div className="grid gap-2 sm:grid-cols-3 sm:gap-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="flex items-start gap-2.5 rounded-lg border p-3 sm:p-4"
              >
                <Skeleton className="mt-0.5 size-4 shrink-0" />

                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton className="h-4 w-24 max-w-full" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-4/5" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main content */}
      <div className="grid min-w-0 items-start gap-5 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:gap-6">
        <div className="min-w-0 space-y-5 sm:space-y-6">
          <ProductInformationSkeleton />
          <ProductVariantsSkeleton />

          {/* SEO suggestions */}
          <Card className="min-w-0">
            <CardHeader className="p-4 sm:p-6">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="mt-2 h-4 w-full max-w-72" />
            </CardHeader>

            <CardContent className="space-y-5 px-4 pb-4 sm:px-6 sm:pb-6">
              <div className="space-y-2">
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-4 w-full" />
              </div>

              <div className="space-y-2">
                <Skeleton className="h-3 w-40" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
              </div>

              <Skeleton className="h-10 w-full rounded-md" />
            </CardContent>
          </Card>
        </div>

        <aside className="min-w-0 space-y-5 sm:space-y-6">
          <AiInsightsSkeleton />
        </aside>
      </div>
    </div>
  );
}
