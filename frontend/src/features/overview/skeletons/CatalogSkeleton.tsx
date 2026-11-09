import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function ProductIntellegenceSkeleton() {
  return (
    <Card>
      <CardContent className="p-0">
        <div className="flex flex-col justify-between gap-3 border-b p-4 sm:flex-row sm:items-center">
          <div className="flex flex-col gap-2 sm:flex-row">
            <Skeleton className="h-9 w-full sm:w-64" />
            <Skeleton className="h-9 w-full sm:w-[180px]" />
          </div>

          <Skeleton className="h-4 w-28" />
        </div>

        <div className="divide-y">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="grid gap-4 p-4 md:grid-cols-[minmax(0,1.5fr)_100px_100px_minmax(0,1.5fr)_32px] md:items-center"
            >
              <div className="flex items-center gap-3">
                <Skeleton className="size-11 shrink-0 rounded-xl" />

                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>

              <div className="space-y-2">
                <Skeleton className="h-3 w-10 md:hidden" />
                <Skeleton className="h-4 w-16" />
              </div>

              <div className="space-y-2">
                <Skeleton className="h-3 w-16 md:hidden" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-3 w-14" />
              </div>

              <div className="space-y-2 rounded-lg bg-muted/50 p-3">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-3/4" />
              </div>

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
