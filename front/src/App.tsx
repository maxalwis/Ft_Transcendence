import { Route, Routes } from 'react-router-dom';

import Map from './features/map/components/Map';
import { NotificationProvider } from './context/notifications/NotificationProvider';

import OAuthCallbackPage from './features/auth/components/OAuthCallbackPage';
import { AuthProvider } from './context/auth/AuthContext';
import './styles/variables.css';
import './styles/global.css';
import { SocketProvider } from './context/socket/SocketProvider';

import { DeleteConfirmPage } from './features/gdpr/DeleteConfirmPage';

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <NotificationProvider>
          <div className="relative w-screen h-screen overflow-hidden">
            {/* The Map takes up the full screen underneath */}
            <div className="absolute inset-0 w-full h-full z-0">
              <Routes>
                <Route path="/" element={<Map />} />
                <Route path="/oauth/callback" element={<OAuthCallbackPage />} />
                <Route path="/account/delete-confirm" element={<DeleteConfirmPage />} />
              </Routes>
            </div>
          </div>
        </NotificationProvider>
      </SocketProvider>
    </AuthProvider>
  );
}
