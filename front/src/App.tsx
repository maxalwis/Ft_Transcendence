import React, { useState } from 'react';
import { Route, Routes } from 'react-router-dom';

import Map from './features/map/components/Map';
import { NotificationProvider } from './context/notifications/NotificationContext';

import OAuthCallbackPage from './features/auth/components/OAuthCallbackPage';
import AuthModal from './features/auth/components/AuthModal';
import { AuthProvider } from './context/auth/AuthContext';
import './styles/variables.css';
import './styles/global.css';
import { SocketProvider } from './context/socket/SocketProvider';

export default function App() {
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const handleOpenAuth = () => {
    setIsAuthOpen(true);
  };

  return (
    <AuthProvider>
      <SocketProvider>
        <NotificationProvider>
          <div className="relative w-screen h-screen overflow-hidden">
            {/* The Map takes up the full screen underneath */}
            <div className="absolute inset-0 w-full h-full z-0">
              <Routes>
                <Route path="/" element={<Map onOpenAuth={handleOpenAuth} />} />
                <Route path="/oauth/callback" element={<OAuthCallbackPage />} />
              </Routes>
            </div>
          </div>

          <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
        </NotificationProvider>
      </SocketProvider>
    </AuthProvider>
  );
}
