import {
  Package,
  ArrowUpRight,
  MessageSquareText,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function OverviewKpiCards() {
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
  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold">At a glance</h2>

        <Badge>IN DEVELOPMENT</Badge>
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
  );
}
