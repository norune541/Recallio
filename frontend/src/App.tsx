import {
  Activity,
  ArrowUpRight,
  Clock3,
  LayoutDashboard,
  MessageSquareText,
  Settings2,
  Sparkles,
  Store,
} from 'lucide-react';

import { Toaster } from '@/components/ui/sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const navigation = [
  {
    label: 'Overview',
    icon: LayoutDashboard,
    active: true,
  },
  {
    label: 'Conversations',
    icon: MessageSquareText,
    active: false,
  },
  {
    label: 'AI Summaries',
    icon: Sparkles,
    active: false,
  },
  {
    label: 'Integrations',
    icon: Store,
    active: false,
  },
  {
    label: 'Settings',
    icon: Settings2,
    active: false,
  },
];

const stats = [
  {
    title: 'Conversations processed',
    value: '1,284',
    description: 'Total conversations analyzed',
    icon: MessageSquareText,
  },
  {
    title: 'AI summaries generated',
    value: '856',
    description: 'Summaries available to agents',
    icon: Sparkles,
  },
  {
    title: 'Estimated time saved',
    value: '12.5 hrs',
    description: 'Across all processed conversations',
    icon: Clock3,
  },
];

const summaries = [
  {
    customer: 'Olivia Martin',
    issue: 'Order delivery delay',
    status: 'Ready',
    updated: '2 min ago',
  },
  {
    customer: 'Jackson Lee',
    issue: 'Refund request',
    status: 'Ready',
    updated: '5 min ago',
  },
  {
    customer: 'Isabella Nguyen',
    issue: 'Product exchange',
    status: 'Processing',
    updated: 'Just now',
  },
];

export default function App() {
  return (
    <>
      <Toaster position="bottom-right" />

      <div className="min-h-svh bg-background text-foreground">
        <div className="grid min-h-svh md:grid-cols-[240px_minmax(0,1fr)]">
          {/* Sidebar */}
          <aside className="hidden border-r md:flex md:flex-col">
            <div className="flex h-16 items-center gap-2 px-6">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Sparkles className="size-4" />
              </div>

              <span className="text-lg font-semibold tracking-tight">
                Recallio
              </span>
            </div>

            <Separator />

            <nav className="flex-1 space-y-1 p-3">
              <p className="px-3 py-2 text-xs font-medium text-muted-foreground">
                WORKSPACE
              </p>

              {navigation.map((item) => {
                const Icon = item.icon;

                return (
                  <Button
                    key={item.label}
                    variant={item.active ? 'secondary' : 'ghost'}
                    className="w-full justify-start gap-3"
                  >
                    <Icon className="size-4" />
                    {item.label}
                  </Button>
                );
              })}
            </nav>

            <div className="p-4">
              <Card>
                <CardContent className="p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <Store className="size-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Shopify store</span>
                  </div>

                  <Badge variant="secondary">Demo data</Badge>

                  <p className="mt-2 text-xs text-muted-foreground">
                    Connect your store to get started.
                  </p>

                  <Button size="sm" className="mt-3 w-full">
                    Connect store
                  </Button>
                </CardContent>
              </Card>
            </div>
          </aside>

          {/* Main content */}
          <main className="min-w-0">
            <header className="flex h-16 items-center justify-between border-b px-4 md:px-8">
              <div>
                <p className="text-sm font-medium">Recallio Workspace</p>
                <p className="text-xs text-muted-foreground">
                  Customer support intelligence
                </p>
              </div>

              <Button variant="outline" size="sm">
                <Settings2 className="mr-2 size-4" />
                Settings
              </Button>
            </header>

            <div className="mx-auto max-w-7xl space-y-8 p-4 md:p-8">
              {/* Page heading */}
              <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <h1 className="text-2xl font-semibold tracking-tight">
                    Overview
                  </h1>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Monitor your AI-generated customer support context.
                  </p>
                </div>

                <Button>
                  <Sparkles className="mr-2 size-4" />
                  Generate summary
                </Button>
              </section>

              {/* Statistics */}
              <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {stats.map((stat) => {
                  const Icon = stat.icon;

                  return (
                    <Card key={stat.title}>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardDescription>{stat.title}</CardDescription>
                        <Icon className="size-4 text-muted-foreground" />
                      </CardHeader>

                      <CardContent>
                        <div className="text-2xl font-semibold tracking-tight">
                          {stat.value}
                        </div>

                        <p className="mt-1 text-xs text-muted-foreground">
                          {stat.description}
                        </p>
                      </CardContent>
                    </Card>
                  );
                })}
              </section>

              {/* Recent summaries */}
              <section>
                <Card>
                  <CardHeader className="flex flex-row items-start justify-between gap-4">
                    <div>
                      <CardTitle>Recent AI summaries</CardTitle>
                      <CardDescription className="mt-1">
                        A quick overview of recent customer conversations.
                      </CardDescription>
                    </div>

                    <Button variant="outline" size="sm">
                      View all
                      <ArrowUpRight className="ml-2 size-4" />
                    </Button>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-4">
                      {summaries.map((summary, index) => (
                        <div key={summary.customer}>
                          {index > 0 && <Separator className="mb-4" />}

                          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                            <div className="min-w-0">
                              <p className="font-medium">{summary.customer}</p>

                              <p className="mt-1 text-sm text-muted-foreground">
                                {summary.issue}
                              </p>
                            </div>

                            <div className="flex items-center gap-3">
                              <Badge
                                variant={
                                  summary.status === 'Ready'
                                    ? 'secondary'
                                    : 'outline'
                                }
                              >
                                {summary.status}
                              </Badge>

                              <span className="whitespace-nowrap text-xs text-muted-foreground">
                                {summary.updated}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </section>

              {/* Activity */}
              <section className="flex items-start gap-3 rounded-lg border p-4">
                <Activity className="mt-0.5 size-5 text-muted-foreground" />

                <div>
                  <p className="text-sm font-medium">Your workspace is ready</p>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Connect a Shopify store to start processing customer
                    conversations and generating AI summaries.
                  </p>
                </div>
              </section>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
