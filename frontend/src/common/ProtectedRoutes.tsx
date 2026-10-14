import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@clerk/react';

import { SlidingSquaresLoader } from '@/components/ui/SlidingSquaresLoader';

type AccessState = 'loading' | 'allowed' | 'denied' | 'error';

export function ProtectedRoute() {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const location = useLocation();

  const [accessState, setAccessState] = useState<AccessState>('loading');

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;

    const controller = new AbortController();

    async function checkAccess() {
      try {
        setAccessState('loading');

        const token = await getToken();

        if (!token) {
          setAccessState('denied');
          return;
        }

        const response = await fetch(`${import.meta.env.VITE_API_URL}/api`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          signal: controller.signal,
        });

        if (response.status === 401 || response.status === 403) {
          setAccessState('denied');
          return;
        }

        if (!response.ok) {
          throw new Error(`Backend error: ${response.status}`);
        }

        setAccessState('allowed');
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          return;
        }

        console.error('Failed to verify access:', error);
        setAccessState('error');
      }
    }

    void checkAccess();

    return () => controller.abort();
  }, [isLoaded, isSignedIn, getToken]);

  if (!isLoaded) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <SlidingSquaresLoader />
      </div>
    );
  }

  if (!isSignedIn || accessState === 'denied') {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (accessState === 'loading') {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <SlidingSquaresLoader />
      </div>
    );
  }

  if (accessState === 'error') {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-3">
        <p>Unable to verify access to the application.</p>

        <button className="underline" onClick={() => window.location.reload()}>
          Try again
        </button>
      </div>
    );
  }

  return <Outlet />;
}
