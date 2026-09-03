import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../context/auth/AuthContext';

interface LoginButtonProps {
  onOpenAuth: () => void;
}

export default function LoginButton({ onOpenAuth }: LoginButtonProps) {
  const { t } = useTranslation();
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
        type="button"
        className="h-10 glass-panel flex items-center justify-center cursor-pointer duration-300 hover:zoom-98"
        onClick={handleLogout}
      >
        {t('authBtn.logout')}
      </button>
    );
  }

  return (
    <button
      type="button"
      className="h-10 glass-panel flex items-center justify-center cursor-pointer duration-300 hover:zoom-98"
      onClick={onOpenAuth}
    >
      {t('authBtn.login')}
    </button>
  );
}
