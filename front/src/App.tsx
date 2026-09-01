import React, { useState } from 'react';
import { Route, Routes } from 'react-router-dom';

import Map from './features/map/components/Map';
import NavBar from './layouts/NavBar';
import { AdminPanelLinks } from './features/externalLinks/AdminPanelLinks';
import { NotificationProvider } from './context/notifications/NotificationContext';
import BottomBar from './layouts/BottomBar';

import OAuthCallbackPage from './features/auth/components/OAuthCallbackPage';
import AuthModal from './features/auth/components/AuthModal';
import { AuthProvider } from './context/auth/AuthContext';

import './styles/variables.css';
import './styles/global.css';

export default function App() {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
    const [activeCategory, setActiveCategory] = useState<string>('');


  const handleOpenAuth = () => {
    setIsAuthOpen(true);
  };

  return (
    <AuthProvider>
      <NotificationProvider>
        <div className="relative w-screen h-screen overflow-hidden">
          {/* The Map takes up the full screen underneath */}
          <div className="absolute inset-0 w-full h-full z-0">
            <Routes>
              <Route path="/" element={<Map onOpenAuth={handleOpenAuth} />} />
              <Route path="/oauth/callback" element={<OAuthCallbackPage />} />
            </Routes>
          </div>

          {/* Floating Navigation Bar for Categories & Languages */}
          <div className="absolute top-4 left-4 right-4 z-20 pointer-events-none">
            <NavBar 
              activeCategory={activeCategory} 
              onSelectCategory={setActiveCategory} 
            />
          </div>

          {/* Floating Three-Dots Admin Menu Component */}
          <div className="absolute top-4 right-4 z-20">
            <AdminPanelLinks />
          </div>

          <BottomBar onOpenAuth={handleOpenAuth} />

          <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
        </div>
      </NotificationProvider>
    </AuthProvider>
  );
}
