import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../context/auth/useAuth';
import { useState, useRef, useEffect } from 'react';
import EditProfile from '../../profile/components/EditProfile.tsx';

interface LoginButtonProps {
  onOpenAuth: () => void;
  embedded?: boolean;
  mobileProfileMenu?: boolean;
  onOpenProfile?: () => void;
  onOpenEditProfile?: () => void;
  onBack?: () => void;
  onCloseMobileMenu?: () => void;
}

export default function LoginButton({
  onOpenAuth,
  embedded = false,
  mobileProfileMenu = false,
  onOpenProfile,
  onOpenEditProfile,
  onBack,
  onCloseMobileMenu,
}: LoginButtonProps) {
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

  if (user && mobileProfileMenu) {
    return (
      <div className="w-full flex flex-col gap-2">
        <button
          type="button"
          className="menuButton"
          onClick={() => {
            onOpenEditProfile?.();
          }}
        >
          {t('authBtn.editProfile')}
        </button>

        <button type="button" className="menuButton" onClick={handleLogout}>
          {t('authBtn.logout')}
        </button>

        <button
          type="button"
          className="menuButton"
          onClick={() => {
            onBack?.();
            onCloseMobileMenu?.();
          }}
        >
          {t('common.back')}
        </button>
      </div>
    );
  }

  if (user) {
    return (
      <div className="relative" ref={menuRef}>
        <button
          className="h-12 w-12 rounded-full! overflow-hidden p-0! flex items-center justify-center cursor-pointer duration-300 hover:zoom-98"
          aria-label={`Ouvrir le menu de ${user.username ?? 'Profile'}`}
          title={user.username ?? 'Profile'}
          onClick={() => {
            if (embedded && onOpenProfile) {
              onOpenProfile();
              return;
            }

            setIsMenuOpen((prev) => !prev);
          }}
        >
          {user.avatar ? (
            <img
              src={user.avatar}
              alt="Avatar"
              referrerPolicy="no-referrer"
              className="block h-full w-full rounded-full object-cover"
            />
          ) : (
            (user.username?.charAt(0).toUpperCase() ?? '?')
          )}
        </button>

        {isMenuOpen && (
          <div className="absolute bottom-full left-1/2 mb-0.5 -translate-x-1/2 glass-panel flex flex-col min-w-40 z-50">
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

        {isEditOpen && (
          <EditProfile
            onClose={() => {
              setIsEditOpen(false);
              onBack?.();
            }}
          />
        )}
      </div>
    );
  }

  return (
    <button className={`${embedded ? 'menuButton' : 'bottomBarButton glass-panel'}`} type="button" onClick={onOpenAuth}>
      {t('authBtn.login')}
    </button>
  );
}
