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

import { useProducts } from '../hooks/getProducts';
import { truncateText } from '@/common/utils/truncateText';

type ProductsResponse = NonNullable<ReturnType<typeof useProducts>['data']>;

type AiReview = NonNullable<ProductsResponse['pages'][number]['aiReview']>;

type Insight = AiReview['insights'][number];

const priorityConfig = {
  high: {
    label: 'High priority',
    className: 'text-amber-600',
    icon: AlertTriangle,
  },
  medium: {
    label: 'Opportunity',
    className: 'text-violet-600',
    icon: Lightbulb,
  },
  low: {
    label: 'Suggestion',
    className: 'text-emerald-600',
    icon: CheckCircle2,
  },
} satisfies Record<
  Insight['priority'],
  {
    label: string;
    className: string;
    icon: typeof AlertTriangle;
  }
>;

const categoryLabels = {
  content: 'Content',
  seo: 'SEO',
  inventory: 'Inventory',
  pricing: 'Pricing',
  product: 'Product',
} satisfies Record<Insight['category'], string>;

type OverviewIntelligenceBriefingProps = {
  aiReview: AiReview | undefined;
};

export function OverviewIntelligenceBriefing({
  aiReview,
}: OverviewIntelligenceBriefingProps) {
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
              <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
                <div>
                  <h3 className="text-lg font-semibold tracking-tight">
                    Here's what deserves your attention
                  </h3>

                  <p className="mt-1 text-sm text-muted-foreground">
                    AI-powered insights based on your store products.
                  </p>
                </div>
              </div>

              {aiReview?.insights.length ? (
                <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {aiReview.insights.map((insight, index) => {
                    const config = priorityConfig[insight.priority];
                    const Icon = config.icon;

                    return (
                      <div
                        key={`${insight.category}-${index}`}
                        className="rounded-xl border p-4"
                      >
                        <div
                          className={`mb-3 flex items-center gap-2 ${config.className}`}
                        >
                          <Icon className="size-4" />

                          <span className="text-xs font-medium uppercase tracking-wide">
                            {config.label}
                          </span>
                        </div>

                        <p className="text-sm font-semibold">
                          {truncateText(insight.title, 65)}
                        </p>

                        <p className="mt-1.5 text-sm leading-5 text-muted-foreground">
                          {truncateText(insight.description, 120)}
                        </p>

                        <Badge variant="outline" className="mt-3 font-normal">
                          {categoryLabels[insight.category]}
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
