import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../context/auth/useAuth';
import { login } from '../../../api/api';
import { useNotification } from '../../../context/notifications/useNotification';
import { CloseIcon } from '../../../types/icons';
import Button from '../../../components/ui/Button';

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
      setAuth(data.user, data.accessToken, { isNewLogin: true });
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

      // Clear the form after successful registration
      setUsername('');
      setPassword('');
      setConfirmPassword('');

      setView('login');
    } catch {
      showWarning(t('authModal.errors.registrationError'));
    }
  };

  const content = (
    <div
      className={
        embedded
          ? 'relative w-full glass-animate-in'
          : 'glass-modal relative p-8 max-w-md w-full glass-animate-in'
      }
    >
      <div className="flex min-h-0 flex-1 flex-col">
        <Button
          variant="icon"
          type="button"
          onClick={onClose}
          aria-label={t('common.close')}
          className="modal-button modal-close"
        >
          <CloseIcon className="h-5 w-5" />
        </Button>
      </div>
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

            <Button variant="ghost" type="submit">
              {t('authModal.loginButton')}
            </Button>
          </form>

          <div dir="ltr" className="flex justify-center gap-2 mt-4">
            <Button
              variant="icon"
              type="button"
              className="glass-panel! rounded-md!"
              onClick={() => (window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`)}
              aria-label={t('authModal.loginWithGoogle')}
            >
              <img
                src="https://img.icons8.com/?size=25&id=17949&format=png&color=000000"
                alt="Google"
              />
            </Button>

            <Button
              variant="icon"
              type="button"
              className="glass-panel! rounded-md!"
              onClick={() => (window.location.href = `${import.meta.env.VITE_API_URL}/auth/42`)}
              aria-label={t('authModal.loginWith42')}
            >
              <img src="https://cdn.simpleicons.org/42?viewbox=auto&size=20" alt="42" />
            </Button>
          </div>

          <div dir="ltr" className="flex items-center justify-center gap-3 text-sm mt-4">
            <span>{t('authModal.noAccount')}</span>

            <Button
              variant="ghost"
              type="button"
              className="unstyled !bg-transparent !border-0 !p-0 text-amber-600 hover:underline cursor-pointer"
              onClick={() => setView('register')}
            >
              {t('authModal.createOne')}
            </Button>
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

            <Button
              variant="primary"
              type="submit"
              className="mt-2 p-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-semibold cursor-pointer"
            >
              {t('authModal.registerButton')}
            </Button>
          </form>

          <div dir="ltr" className="flex items-center justify-center gap-3 text-sm mt-4">
            <span>{t('authModal.alreadyHaveAccount')}</span>

            <Button
              variant="ghost"
              type="button"
              className="unstyled !bg-transparent !border-0 !p-0 text-amber-600 hover:underline cursor-pointer"
              onClick={() => setView('login')}
            >
              {t('authModal.signInLink')}
            </Button>
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
