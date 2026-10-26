import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { ProtectedRoute } from './common/ProtectedRoutes';
import { LoginPage } from './features/auth/pages/LoginPage';
import { SignupPage } from './features/auth/pages/SignupPage';
import { SettingsPage } from './features/settings/pages/SettingsPage';
import { RateLimitLayout } from './components/RateLimit';
import { NotFoundPage } from './common/pages/NotFoundPage';

import AppLayout from './AppLayout';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="*" element={<NotFoundPage />} />
        <Route element={<RateLimitLayout />}>
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<AppLayout />}>
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
