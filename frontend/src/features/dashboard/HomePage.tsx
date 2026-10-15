import { useEffect, useState } from 'react';
import { useAuth, useUser } from '@clerk/react';

import { SlidingSquaresLoader } from '@/components/ui/SlidingSquaresLoader';

interface MeResponse {
  userId: string;
  sessionId: string | null;
  firstName: string | null;
  lastName: string | null;
  fullName: string | null;
  email: string | null;
  username: string | null;
  createdAt: string | null;
}

export function HomePage() {
  const { isLoaded: isAuthLoaded, isSignedIn, getToken, sessionId } = useAuth();

  const { isLoaded: isUserLoaded, user } = useUser();

  const [me, setMe] = useState<MeResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthLoaded || !isUserLoaded || !isSignedIn || !user) {
      return;
    }

    let cancelled = false;

    async function fetchMe() {
      try {
        const token = await getToken();

        if (!token) {
          throw new Error('Unable to retrieve Clerk session token.');
        }

        const response = await fetch('http://localhost:3000/api/users', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(
            `Request failed: ${response.status} ${response.statusText}`,
          );
        }

        const data: MeResponse = await response.json();

        if (!cancelled) {
          setMe(data);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : 'An unexpected error occurred.',
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void fetchMe();

    return () => {
      cancelled = true;
    };
  }, [isAuthLoaded, isUserLoaded, isSignedIn, user, getToken]);

  if (!isAuthLoaded || !isUserLoaded) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <SlidingSquaresLoader />
      </div>
    );
  }

  if (!isSignedIn || !user) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <p>User is not authenticated.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <SlidingSquaresLoader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!me) {
    return <p>No user data received.</p>;
  }

  return (
    <main className="min-h-dvh p-8">
      <h1 className="mb-6 text-2xl font-bold">Home Page</h1>

      <div className="space-y-2">
        <p>
          <strong>User ID:</strong> {me.userId}
        </p>
        <p>
          <strong>Session ID:</strong>{' '}
          {me.sessionId ?? sessionId ?? 'Not available'}
        </p>
        <p>
          <strong>First Name:</strong> {me.firstName ?? 'Not provided'}
        </p>
        <p>
          <strong>Last Name:</strong> {me.lastName ?? 'Not provided'}
        </p>
        <p>
          <strong>Full Name:</strong> {me.fullName ?? 'Not provided'}
        </p>
        <p>
          <strong>Email:</strong> {me.email ?? 'Not provided'}
        </p>
        <p>
          <strong>Username:</strong> {me.username ?? 'Not provided'}
        </p>
        <p>
          <strong>Created At:</strong>{' '}
          {me.createdAt
            ? new Date(me.createdAt).toLocaleDateString()
            : 'Not available'}
        </p>
        <p>
          <strong>Authenticated:</strong> Yes
        </p>
      </div>

      <h2 className="mt-8 mb-3 text-lg font-semibold">API Response</h2>

      <pre className="overflow-auto rounded-lg bg-gray-100 p-4 text-sm">
        {JSON.stringify(me, null, 2)}
      </pre>
    </main>
  );
}
