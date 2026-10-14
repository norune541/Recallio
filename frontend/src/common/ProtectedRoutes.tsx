import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@clerk/react';

import { SlidingSquaresLoader } from '@/components/ui/SlidingSquaresLoader';

export function ProtectedRoute() {
  const { isLoaded, isSignedIn } = useAuth();
  const location = useLocation();

  if (!isLoaded) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <SlidingSquaresLoader />
      </div>
    );
  }

  if (!isSignedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
