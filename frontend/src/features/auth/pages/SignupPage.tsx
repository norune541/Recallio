import { SignUp } from '@clerk/react';
import { AuthBackground } from '@/components/ui/AuthBackground';
import { SlidingSquaresLoader } from '@/components/ui/SlidingSquaresLoader';

export function SignupPage() {
  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-x-hidden">
      <AuthBackground />

      <div className="relative z-10 py-6">
        <SignUp
          appearance={{
            theme: 'simple',
            variables: {
              colorPrimary: '#6366F1',
              colorRing: '#6366F1',
            },
          }}
          signInUrl="/login"
          fallback={
            <div className="flex min-h-80 items-center justify-center">
              <SlidingSquaresLoader />
            </div>
          }
        />
      </div>
    </div>
  );
}
