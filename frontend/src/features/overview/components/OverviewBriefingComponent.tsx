import {
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Zap,
  AlertTriangle,
  Lightbulb,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

import { useProducts } from '../hooks/getProducts';
import { truncateText } from '@/common/utils/truncateText';

const priorityConfig = {
  high: {
    rank: 0,
    label: 'High priority',
    className: 'text-amber-600',
    icon: AlertTriangle,
  },
  medium: {
    rank: 1,
    label: 'Opportunity',
    className: 'text-violet-600',
    icon: Lightbulb,
  },
  low: {
    rank: 2,
    label: 'Suggestion',
    className: 'text-emerald-600',
    icon: CheckCircle2,
  },
};

type Insight = {
  category: string;
  priority: keyof typeof priorityConfig;
  title: string;
  description: string;
};

export function OverviewIntelligenceBriefing() {
  const { data, isPending, isError, error } = useProducts();

  // InfiniteQuery: insights from all pages already loaded.
  const insights = (
    data?.pages
      .flatMap((page) => page.items)
      .flatMap(
        (product) =>
          (product.productReview?.insights as Insight[] | undefined) ?? [],
      ) ?? []
  )
    .sort(
      (a, b) =>
        priorityConfig[a.priority].rank - priorityConfig[b.priority].rank,
    )
    .slice(0, 3);

  return (
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
              <h3 className="text-lg font-semibold tracking-tight">
                Here's what deserves your attention
              </h3>

              <p className="mt-1 text-sm text-muted-foreground">
                AI-powered insights based on your store products.
              </p>

              {isPending ? (
                <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <Skeleton key={index} className="h-36 rounded-xl" />
                  ))}
                </div>
              ) : isError ? (
                <p className="mt-5 text-sm text-destructive">{error.message}</p>
              ) : insights.length > 0 ? (
                <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {insights.map((insight, index) => {
                    const {
                      label,
                      className,
                      icon: Icon,
                    } = priorityConfig[insight.priority];

                    return (
                      <div
                        key={`${insight.category}-${index}`}
                        className="rounded-xl border p-4"
                      >
                        <div
                          className={`mb-3 flex items-center gap-2 ${className}`}
                        >
                          <Icon className="size-4" />

                          <span className="text-xs font-medium uppercase tracking-wide">
                            {label}
                          </span>
                        </div>

                        <p className="text-sm font-semibold">
                          {truncateText(insight.title, 65)}
                        </p>

                        <p className="mt-1.5 text-sm leading-5 text-muted-foreground">
                          {truncateText(insight.description, 120)}
                        </p>

                        <Badge
                          variant="outline"
                          className="mt-3 font-normal capitalize"
                        >
                          {insight.category}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="mt-5 rounded-xl border border-dashed p-6 text-center">
                  <CheckCircle2 className="mx-auto size-8 text-emerald-600" />

                  <p className="mt-2 text-sm font-medium">
                    No significant issues found
                  </p>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Your products look good based on the current analysis.
                  </p>
                </div>
              )}

              <div className="mt-5 flex flex-col justify-between gap-3 border-t pt-4 sm:flex-row sm:items-center">
                <p className="text-xs leading-5 text-muted-foreground">
                  AI-generated insights based on your Shopify product data.
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
  );
}
