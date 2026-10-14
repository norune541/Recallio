import { useAuth } from '@clerk/react';
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { SlidingSquaresLoader } from '@/components/ui/SlidingSquaresLoader';

export function PostAuthPage() {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const navigate = useNavigate();
  const requestStarted = useRef(false);

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      navigate('/login', { replace: true });
      return;
    }

    if (requestStarted.current) return;
    requestStarted.current = true;

    const createUser = async () => {
      try {
        const token = await getToken();

        if (!token) {
          throw new Error('Failed to get Clerk token');
        }

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/users`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          },
        );

        if (!response.ok && response.status !== 409) {
          throw new Error(`Request failed: ${response.status}`);
        }

        navigate('/', { replace: true });
      } catch (error) {
        console.error('Failed to create user:', error);
        requestStarted.current = false;
      }
    };

    void createUser();
  }, [isLoaded, isSignedIn, getToken, navigate]);

  return (
    <div className="flex min-h-dvh items-center justify-center">
      <SlidingSquaresLoader />
    </div>
  );
}
