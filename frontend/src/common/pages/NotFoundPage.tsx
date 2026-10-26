import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import {
  ArrowLeft,
  ArrowUpRight,
  LayoutGrid,
  MessageSquareText,
  Sparkles,
  Store,
  type LucideIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

type Destination = {
  to: string;
  label: string;
  description: string;
  icon: LucideIcon;
};

const DESTINATIONS: Destination[] = [
  {
    to: '/',
    label: 'Overview',
    description: 'Store metrics and the intelligence briefing',
    icon: LayoutGrid,
  },
  {
    to: '/conversations',
    label: 'Conversations',
    description: 'Customer chats analyzed by AI',
    icon: MessageSquareText,
  },
  {
    to: '/ai-summaries',
    label: 'AI Summaries',
    description: 'Recurring questions and product signals',
    icon: Sparkles,
  },
  {
    to: '/integrations',
    label: 'Integrations',
    description: 'Connect and manage your Shopify store',
    icon: Store,
  },
];

const Four: React.FC<{ delay?: number; className?: string }> = ({
  delay = 0,
  className,
}) => {
  const reduceMotion = useReducedMotion();

  return (
    <svg
      viewBox="0 0 240 300"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <motion.path
        d="M170 36 L36 190 H210 M170 36 V270"
        className="stroke-primary/15"
        strokeWidth={48}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={reduceMotion ? false : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.1, delay, ease: [0.22, 1, 0.36, 1] }}
      />
    </svg>
  );
};

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-12">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-primary/5 to-transparent"
      />

      <div className="relative flex w-full items-center justify-center gap-8 xl:gap-14">
        <Four className="hidden h-[360px] w-auto lg:block xl:h-[420px]" />

        <motion.section
          initial={reduceMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.5 }}
          aria-labelledby="not-found-title"
          className="relative w-full max-w-md rounded-2xl border bg-card p-6 text-card-foreground shadow-sm sm:p-8"
        >
          <h1
            id="not-found-title"
            className="text-2xl font-semibold tracking-tight sm:text-3xl"
          >
            Page not found
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This page doesn’t exist or was moved. Choose a section below to
            continue.
          </p>

          <nav aria-label="Available sections" className="mt-6 space-y-2">
            {DESTINATIONS.map(({ to, label, description, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className="group flex items-center gap-3 rounded-xl border bg-background p-3 transition-colors hover:border-primary/30 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
                  <Icon className="size-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium leading-tight">
                    {label}
                  </span>
                  <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                    {description}
                  </span>
                </span>
                <ArrowUpRight className="size-4 shrink-0 text-muted-foreground transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
              </Link>
            ))}
          </nav>

          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate(-1)}
              className="sm:w-auto"
            >
              <ArrowLeft className="size-4" />
              Go back
            </Button>
            <Button className="sm:w-auto">
              <Link to="/">Go to overview</Link>
            </Button>
          </div>
        </motion.section>

        <div className="relative hidden lg:block">
          <Four delay={0.25} className="h-[360px] w-auto xl:h-[420px]" />
        </div>
      </div>
    </main>
  );
};

export default NotFoundPage;
