import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { injectRateLimitHandler } from '@/common/api';
import { Server, ShieldAlert } from 'lucide-react';

const RATE_LIMIT = 100;
const RATE_WINDOW_SEC = 60;

export const RateLimitLayout: React.FC = () => {
  const [isLimited, setIsLimited] = useState(false);

  useEffect(() => {
    const unsubscribe = injectRateLimitHandler(() => {
      setIsLimited(true);
    });
    return typeof unsubscribe === 'function' ? unsubscribe : undefined;
  }, []);

  return (
    <>
      <Outlet />

      {isLimited && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in-0"
          role="alertdialog"
          aria-live="polite"
        >
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-blue-600/20 to-transparent pointer-events-none" />

          <div className="relative w-full max-w-lg rounded-2xl border bg-card text-card-foreground shadow-2xl p-8 flex flex-col items-center text-center space-y-6">
            <div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-blue-50 text-blue-600 mb-2">
              <Server className="w-10 h-10" />
              <div className="absolute -top-1 -right-1 bg-background rounded-full p-1 border shadow-sm">
                <ShieldAlert className="w-5 h-5 text-destructive" />
              </div>
            </div>

            <div className="space-y-2 mt-4">
              <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center justify-center gap-2">
                <span className="text-[#3c3ca1]">429</span>
                <span className="text-muted-foreground font-light">|</span>
                <span className="text-[#3c3ca1]">Too Many Requests</span>
              </h2>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                No more than {RATE_LIMIT} requests are allowed per{' '}
                {RATE_WINDOW_SEC} seconds. You have sent too many requests
                recently.
              </p>
            </div>

            <p className="text-xs text-muted-foreground tracking-wider font-medium">
              Please try again later.
            </p>
          </div>
        </div>
      )}
    </>
  );
};
