import {
  ArrowRight,
  MessageSquareText,
  Package,
  Sparkles,
  Store,
} from 'lucide-react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const benefits = [
  {
    icon: Package,
    title: 'Product intelligence',
    description: 'Understand product performance and discover opportunities.',
  },
  {
    icon: MessageSquareText,
    title: 'Customer conversations',
    description: 'Turn recurring questions into actionable customer insights.',
  },
  {
    icon: Sparkles,
    title: 'AI-powered insights',
    description: 'Discover trends and signals across your store.',
  },
];

export function ShopNotConnectedMainComponent() {
  return (
    <section className="flex min-h-[60vh] w-full items-center justify-center py-8">
      {/* gap-0 py-0: Card ships with its own vertical padding/gap, which would
          keep the muted side panel from reaching the card edges */}
      <Card className="w-full max-w-4xl gap-0 overflow-hidden py-0">
        <div className="grid lg:grid-cols-[1.15fr_0.85fr]">
          {/* Main content */}
          <div className="flex flex-col justify-center gap-8 p-6 sm:p-10">
            <div className="flex items-center justify-between gap-3">
              <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Store className="size-6" />
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <h2 className="max-w-md text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
                Bring your store data into Recallio
              </h2>
              <p className="max-w-md text-sm leading-6 text-muted-foreground sm:text-base">
                Connect your Shopify store to unlock product intelligence,
                customer conversation analysis, and AI-powered insights — all in
                one workspace.
              </p>
            </div>

            <div className="flex flex-col items-start gap-3">
              <Button
                size="lg"
                render={<Link to="/integrations" />}
                className="w-full gap-2 sm:w-auto"
              >
                Connect Shopify store
                <ArrowRight data-icon="inline-end" />
              </Button>
            </div>
          </div>

          {/* Benefits panel */}
          <div className="flex flex-col justify-center gap-6 border-t bg-muted/30 p-6 sm:p-10 lg:border-t-0 lg:border-l">
            <div className="flex flex-col gap-1">
              <h3 className="text-sm font-semibold">What you'll unlock</h3>
              <p className="text-sm text-muted-foreground">
                Everything you need to understand your customers and products.
              </p>
            </div>

            <ul className="flex flex-col gap-5">
              {benefits.map(({ icon: Icon, title, description }) => (
                <li key={title} className="flex items-start gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border bg-background">
                    <Icon className="size-5 text-muted-foreground" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm font-medium">{title}</p>
                    <p className="mt-0.5 text-sm leading-5 text-muted-foreground">
                      {description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Card>
    </section>
  );
}
