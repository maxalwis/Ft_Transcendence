import React from 'react';
import { Route, Routes } from 'react-router-dom';
import LoginPage from './features/auth/components/LoginPage';
import Map from './features/map/components/Map';
import { AdminPanelLinks } from './features/externalLinks/AdminPanelLinks';
import { NotificationProvider } from './context/notifications/NotificationContext';
import RegisterPage from './features/auth/components/RegisterPage';
import OAuthCallbackPage from './features/auth/components/OAuthCallbackPage';
import { AuthProvider } from './context/auth/AuthContext';
import './styles/variables.css';
import './styles/global.css';

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <div className="relative w-screen h-screen overflow-hidden">
          {/* The Map takes up the full screen underneath */}
          <div className="absolute inset-0 w-full h-full z-0">
            <Routes>
              <Route path="/" element={<Map />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/oauth/callback" element={<OAuthCallbackPage />} />
            </Routes>
          </div>

          {/* Floating Three-Dots Admin Menu Component */}
          <div className="absolute top-4 right-4 z-20">
            <AdminPanelLinks />
          </div>
        </div>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
