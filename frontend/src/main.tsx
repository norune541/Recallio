import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ClerkProvider } from '@clerk/react';

import './index.css';
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
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
  </StrictMode>,
);
