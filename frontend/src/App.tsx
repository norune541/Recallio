import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { ProtectedRoute } from './common/ProtectedRoutes';
import { LoginPage } from './features/auth/pages/LoginPage';
import { SignupPage } from './features/auth/pages/SignupPage';
<<<<<<< HEAD
import { SettingsPage } from './features/settings/pages/SettingsPage';
=======
import { PostAuthPage } from './features/auth/pages/PostAuthPage';
import { SettingsPage } from './features/settings/pages/SettingsPage';
import { OverviewPage } from './features/overview/pages/OverviewPage';
import { GetProductDetailsPage } from './features/overview/pages/ProductDetailsPage';
>>>>>>> f871398 (feat: add ProductDetailsPage component with product metrics, AI insights, and recent activity)
import AppLayout from './AppLayout';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<OverviewPage />}></Route>
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/details" element={<GetProductDetailsPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
