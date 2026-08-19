import MyMap from './components/Map/MyMap';
import { Routes, Route } from 'react-router-dom';
import LoginPage from './components/BottomBar/Auth/LoginPage';

function App() {
	return (
	<Routes>
		<Route path="/" element={<MyMap />} />
		<Route path="/login" element={<LoginPage />} />
	</Routes>
	);
}

export default App;
