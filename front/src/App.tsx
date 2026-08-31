import React, { useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import Map from './features/map/components/Map';
import NavBar from './layouts/NavBar';
import LoginPage from './features/auth/components/LoginPage';
import RegisterPage from './features/auth/components/RegisterPage';
import OAuthCallbackPage from './features/auth/components/OAuthCallbackPage';
import { AdminPanelLinks } from './features/externalLinks/AdminPanelLinks';
import { NotificationProvider } from './context/notifications/NotificationContext';
import { AuthProvider } from './context/auth/AuthContext';
import './styles/variables.css';
import './styles/global.css';

function App() {
  const [activeCategory, setActiveCategory] = useState<string>('');

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
        </div>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;