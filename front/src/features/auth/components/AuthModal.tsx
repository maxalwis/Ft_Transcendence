import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../context/auth/useAuth';
import { login } from '../../../api/api';
import { useNotification } from '../../../context/notifications/useNotification';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  embedded?: boolean;
}

export default function AuthModal({ isOpen, onClose, embedded = false }: AuthModalProps) {
  const { t } = useTranslation();
  const [view, setView] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { showWarning } = useNotification();

  const { setAuth } = useAuth();

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const data = await login(email, password);
      setAuth(data.user, data.accessToken);
      onClose();
    } catch {
      showWarning(t('authModal.errors.invalidCredentials'));
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      showWarning(t('authModal.errors.passwordMismatch'));
      return;
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });

      if (!res.ok) throw new Error();

      setView('login');
    } catch {
      showWarning(t('authModal.errors.registrationError'));
    }
  };

  const content = (
    <div
      className={
        embedded ? 'relative w-full' : 'glass-modal relative p-8 max-w-md w-full glass-animate-in'
      }
    >
      <button
        type="button"
        onClick={onClose}
        aria-label={t('authModal.close')}
        className="modal-button modal-close"
      >
        <svg
          className="h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>

      {view === 'login' ? (
        <div>
          <h1 className="font-extrabold text-2xl mb-4 text-center">{t('authModal.loginTitle')}</h1>

          <form className="flex flex-col gap-3" onSubmit={handleLoginSubmit}>
            <input
              className="glass-panel p-2 rounded-lg border-2"
              type="email"
              placeholder={t('authModal.email')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              className="glass-panel p-2 rounded-lg border-2"
              type="password"
              placeholder={t('authModal.password')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button type="submit" className="mt-2 p-2 rounded-lg font-semibold cursor-pointer">
              {t('authModal.loginButton')}
            </button>
          </form>

          <div dir="ltr" className="flex justify-center gap-2 mt-4">
            <button
              type="button"
              onClick={() => (window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`)}
              className="glass-panel p-2 rounded-md cursor-pointer"
              aria-label={t('authModal.loginWithGoogle')}
            >
              <img
                src="https://img.icons8.com/?size=25&id=17949&format=png&color=000000"
                alt="Google"
              />
            </button>

            <button
              type="button"
              onClick={() => (window.location.href = `${import.meta.env.VITE_API_URL}/auth/42`)}
              className="glass-panel p-2 rounded-md cursor-pointer"
              aria-label={t('authModal.loginWith42')}
            >
              <img src="https://cdn.simpleicons.org/42?viewbox=auto&size=20" alt="42" />
            </button>
          </div>

          <div dir="ltr" className="flex items-center justify-center gap-3 text-sm mt-4">
            <span>{t('authModal.noAccount')}</span>

            <button
              type="button"
              className="unstyled text-amber-600 hover:underline cursor-pointer"
              onClick={() => setView('register')}
            >
              {t('authModal.createOne')}
            </button>
          </div>
        </div>
      ) : (
        <div>
          <h1 className="font-extrabold text-2xl mb-4 text-center">
            {t('authModal.registerTitle')}
          </h1>

          <form className="flex flex-col gap-3" onSubmit={handleRegisterSubmit}>
            <input
              className="glass-panel p-2 rounded-lg border-2"
              type="email"
              placeholder={t('authModal.email')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              className="glass-panel p-2 rounded-lg border-2"
              type="text"
              placeholder={t('authModal.username')}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />

            <input
              className="glass-panel p-2 rounded-lg border-2"
              type="password"
              placeholder={t('authModal.password')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <input
              className="glass-panel p-2 rounded-lg border-2"
              type="password"
              placeholder={t('authModal.confirmPassword')}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            <button
              type="submit"
              className="mt-2 p-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-semibold cursor-pointer"
            >
              {t('authModal.registerButton')}
            </button>
          </form>

          <div dir="ltr" className="flex items-center justify-center gap-3 text-sm mt-4">
            <span>{t('authModal.alreadyHaveAccount')}</span>

            <button
              type="button"
              className="unstyled text-amber-600 hover:underline cursor-pointer"
              onClick={() => setView('login')}
            >
              {t('authModal.signInLink')}
            </button>
          </div>
        </div>
      )}
    </div>
  );

  if (embedded) {
    return content;
  }

  return (
    <div className="glass-modal-overlay" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()}>{content}</div>
    </div>
  );
}
