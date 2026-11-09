import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

// Heights mirror the shape of the real weekly chart so the layout doesn't jump
const BAR_HEIGHTS = [38, 58, 46, 75, 62, 88, 69];

export function OverviewSkeleton() {
  return (
    <div
      className="space-y-8 pb-8"
      role="status"
      aria-busy="true"
      aria-live="polite"
    >
      {/* PAGE HEADER */}
      <section>
        <div className="mb-3 flex items-center gap-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="size-3.5 rounded-full" />
          <Skeleton className="h-4 w-16" />
        </div>

        <Skeleton className="h-8 w-52 sm:h-9" />
        <Skeleton className="mt-3 h-4 w-full max-w-2xl" />
        <Skeleton className="mt-2 h-4 w-2/3 max-w-xl" />
      </section>

      {/* KPI CARDS */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-3 w-36" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-9 w-20" />
                  </div>
                  <Skeleton className="size-10 shrink-0 rounded-xl" />
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* AI INSIGHTS */}
      <section>
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Skeleton className="size-5 rounded" />
            <Skeleton className="h-5 w-40" />
          </div>
          <Skeleton className="h-5 w-24 rounded-full" />
        </div>

        <Card className="overflow-hidden">
          <Skeleton className="h-1 w-full rounded-none" />

          <CardContent className="p-5 sm:p-6">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
              <Skeleton className="size-12 shrink-0 rounded-2xl" />

              <div className="min-w-0 flex-1">
                <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-64 max-w-full" />
                    <Skeleton className="h-4 w-52 max-w-full" />
                  </div>
                  <Skeleton className="h-4 w-28" />
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="rounded-xl border p-4">
                      <Skeleton className="mb-3 h-4 w-28" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="mt-2.5 h-3 w-full" />
                      <Skeleton className="mt-2 h-3 w-5/6" />
                    </div>
                  ))}
                </div>

                <div className="mt-5 flex flex-col justify-between gap-3 border-t pt-4 sm:flex-row sm:items-center">
                  <Skeleton className="h-3 w-full max-w-md" />
                  <Skeleton className="h-8 w-32" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* ANALYTICS + PRIORITY ACTIONS */}
      <section className="grid gap-4 xl:grid-cols-5">
        <Card className="xl:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="space-y-2">
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-4 w-48" />
            </div>
            <Skeleton className="size-9 rounded-md" />
          </CardHeader>

          <CardContent className="pt-4">
            <div className="flex items-end justify-between gap-4">
              <div className="space-y-2">
                <Skeleton className="h-9 w-24" />
                <Skeleton className="h-4 w-44" />
              </div>
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>

            <div className="mt-8 grid h-44 grid-cols-7 items-end gap-3">
              {BAR_HEIGHTS.map((height, i) => (
                <div
                  key={i}
                  className="flex h-full flex-col items-center justify-end gap-2"
                >
                  <div className="flex w-full flex-1 items-end">
                    <Skeleton
                      className="w-full rounded-b-none"
                      style={{ height: `${height}%` }}
                    />
                  </div>
                  <Skeleton className="h-3 w-6" />
                </div>
              ))}
            </div>

            <div className="mt-5 flex items-center gap-2 border-t pt-4">
              <Skeleton className="size-2 rounded-full" />
              <Skeleton className="h-3 w-56" />
            </div>
          </CardContent>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-3">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-5 w-14 rounded-full" />
            </div>
            <Skeleton className="mt-1 h-4 w-56 max-w-full" />
          </CardHeader>

          <CardContent className="space-y-1">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3 rounded-lg p-3">
                <Skeleton className="size-9 shrink-0 rounded-lg" />
                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton className="h-4 w-40 max-w-full" />
                  <Skeleton className="h-3 w-52 max-w-full" />
                </div>
                <Skeleton className="mt-1 size-4 shrink-0 rounded" />
              </div>
            ))}

            <Skeleton className="mt-3 h-9 w-full" />
          </CardContent>
        </Card>
      </section>

      {/* RECENT ACTIVITY + AI COVERAGE */}
      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-8 w-20" />
            </div>
          </CardHeader>

          <CardContent>
            <div className="space-y-5">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="size-9 shrink-0 rounded-xl" />
                  <div className="min-w-0 flex-1 space-y-2">
                    <Skeleton className="h-4 w-48 max-w-full" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Skeleton className="size-9 rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-4 w-48" />
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-5">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i}>
                <div className="mb-2 flex items-center justify-between">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-4 w-8" />
                </div>
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
            ))}

            <div className="flex items-start gap-3 rounded-xl border p-3">
              <Skeleton className="size-4 shrink-0 rounded" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-4/5" />
              </div>
            </div>

            <Skeleton className="h-9 w-full" />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
