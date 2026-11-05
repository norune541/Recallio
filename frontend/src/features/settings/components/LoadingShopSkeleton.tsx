import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useIsMobile } from '@/common/hooks/use-mobile';

export function LoadingShopSkeleton() {
  const isMobile = useIsMobile();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Skeleton className="size-10 shrink-0 rounded-lg" />

          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-5 w-40 max-w-full" />
            <Skeleton className="h-4 w-48 max-w-full" />
          </div>

          {!isMobile && <Skeleton className="h-6 w-20 shrink-0 rounded-full" />}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {['Shop owner', 'Plan', 'Email', 'Currency', 'Store URL'].map(
            (label) => (
              <div key={label} className="min-w-0 space-y-2">
                <Skeleton className="h-4 w-20 max-w-full" />
                <Skeleton className="h-4 w-32 max-w-full" />
              </div>
            ),
          )}
        </div>

        {/* Setup required */}
        <Skeleton className="h-16 w-full rounded-lg" />

        {/* Plan badge and mobile Connected badge */}
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-6 w-28 rounded-full" />

          {isMobile && <Skeleton className="h-6 w-24 rounded-full" />}
        </div>
      </CardContent>
    </Card>
  );
}
