import { useAuth } from '../../../context/auth/AuthContext';

interface LoginButtonProps {
  onOpenAuth: () => void;
}

export default function LoginButton({ onOpenAuth }: LoginButtonProps) {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await fetch(`https://localhost:${import.meta.env.VITE_HTTPS_PORT}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch {
      // ignore network errors on logout
    } finally {
      logout();
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
      className="h-10 w-25 glass-panel flex items-center justify-center cursor-pointer duration-300 hover:zoom-98"
      onClick={onOpenAuth}
    >
      Login
    </button>
  );
}