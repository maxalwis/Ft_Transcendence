import React from 'react';
import { Route, Routes } from 'react-router-dom';
import LoginPage from './features/auth/components/LoginPage';
import MyMap from './components/Map/MyMap';
import { AdminPanelLinks } from './features/externalLinks/AdminPanelLinks';
import { NotificationProvider } from './context/notifications/NotificationContext';
import RegisterPage from './features/auth/components/RegisterPage';
import { AuthProvider } from './context/auth/AuthContext';

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <div className="relative w-screen h-screen overflow-hidden">
          {/* The Map takes up the full screen underneath */}
          <div className="absolute inset-0 w-full h-full z-0">
            <Routes>
              <Route path="/" element={<MyMap />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
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
