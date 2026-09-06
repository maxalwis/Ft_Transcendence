import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../context/auth/AuthContext';
import { useState, useRef, useEffect } from 'react';
import EditProfile from '../../profile/EditProfile.tsx';

interface LoginButtonProps {
  onOpenAuth: () => void;
}

export default function LoginButton({ onOpenAuth }: LoginButtonProps) {
  const { t } = useTranslation();
  const { user, logout } = useAuth();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // ferme le dropdown si on clique en dehors
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
      setIsMenuOpen(false);
    }
  };

  if (user) {
    return (
      <div className="relative" ref={menuRef}>
        <button
          className="h-12 w-12 rounded-full! overflow-hidden p-0! glass-panel flex items-center justify-center cursor-pointer duration-300 hover:zoom-98"
          aria-label={`Ouvrir le menu de ${user.username ?? 'Profil'}`}
          title={user.username ?? 'Profil'}
          onClick={() => {
            setIsMenuOpen((prev) => !prev);
            console.log('clicked, isMenuOpen avant:', isMenuOpen);
          }}
        >
          {user.avatar ? (
            <img
              src={user.avatar}
              alt="Avatar"
              className="block h-full w-full rounded-full object-cover"
            />
          ) : (
            (user.username?.charAt(0).toUpperCase() ?? '?')
          )}
        </button>

        {isMenuOpen && (
          <div className="absolute bottom-full left-1/2 mb-0.5 -translate-x-1/2 glass-panel flex flex-col min-w-40 z-1000">
            <button
              className="px-4 py-2 text-left hover:bg-white/10"
              onClick={() => {
                setIsEditOpen(true);
                setIsMenuOpen(false);
              }}
            >
              {t('authBtn.editProfile')}
            </button>
            <button className="px-4 py-2 text-left hover:bg-white/10" onClick={handleLogout}>
              {t('authBtn.logout')}
            </button>
          </div>
        )}

        {isEditOpen && <EditProfile onClose={() => setIsEditOpen(false)} />}
      </div>
    );
  }

  return (
    <button
      className="h-10 w-25 glass-panel flex items-center justify-center cursor-pointer duration-300 hover:zoom-98"
      type="button"
      onClick={onOpenAuth}
    >
      {t('authBtn.login')}
    </button>
  );
}
