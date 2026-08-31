import { useAuth } from '../../../context/auth/AuthContext.tsx';
import { useNavigate } from 'react-router-dom';

export default function LoginButton() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogin = () => {
    window.location.href = `https://localhost:${import.meta.env.VITE_HTTPS_PORT}/login/`;
  };

  const handleLogout = async () => {
    try {
      await fetch(`https://localhost:${import.meta.env.VITE_HTTPS_PORT}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch {
      // on ignore une éventuelle erreur réseau, on déconnecte quand même côté client
    } finally {
      logout();
      window.location.reload();
    }
  };

  if (user) {
    return (
      <button
        className="h-10 w-25 glass-panel flex items-center justify-center cursor-pointer duration-300 hover:zoom-98"
        onClick={handleLogout}
      >
        Logout
      </button>
    );
  }

  return (
    <button
      className=" h-10 w-25 glass-panel flex items-center justify-center cursor-pointer duration-300 hover:zoom-98"
      onClick={handleLogin}
    >
      Connexion
    </button>
  );
}
