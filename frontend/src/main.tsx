import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ClerkProvider } from '@clerk/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './index.css';
import App from './App.tsx';

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ClerkProvider
        appearance={{
          variables: {
            colorPrimary: '#6366F1',
            colorRing: '#6366F1',
          },
        }}
      >
        <App />
      </ClerkProvider>
    </QueryClientProvider>
  </StrictMode>,
);
