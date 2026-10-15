import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { ProtectedRoute } from './common/ProtectedRoutes';
import { LoginPage } from './features/auth/pages/LoginPage';
import { SignupPage } from './features/auth/pages/SignupPage';
import { PostAuthPage } from './features/auth/pages/PostAuthPage';
import SettingsPage from './features/settings/pages/SettingsPage';
import AppLayout from './AppLayout';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/post-auth" element={<PostAuthPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<AppLayout />}>
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
