import React from 'react';
import { Route, Routes } from 'react-router-dom';
import LoginPage from './components/BottomBar/Auth/LoginPage';
import MyMap from './components/Map/MyMap';
import { AdminPanelLinks } from './components/Dashboard/AdminPanelLinks';
import { NotificationProvider } from './components/Context/NotificationContext';

function App() {
  return (
	<NotificationProvider>
		<div className="relative w-screen h-screen overflow-hidden">
			{/* The Map takes up the full screen underneath */}
			<div className="absolute inset-0 w-full h-full z-0">
			<Routes>
				<Route path="/" element={<MyMap />} />
				<Route path="/login" element={<LoginPage />} />
			</Routes>
			</div>

			{/* Floating Three-Dots Admin Menu Component */}
			<div className="absolute top-4 right-4 z-20">
			<AdminPanelLinks />
			</div>
		</div>
	</NotificationProvider>

  );
}

export default App;