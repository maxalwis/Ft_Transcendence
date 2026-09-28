import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../context/auth/useAuth';
import { login } from '../../../api/api';
import { useNotification } from '../../../context/notifications/useNotification';
import ModalLayout from '../../../components/ui/ModalLayout';
import Button from '../../../components/ui/Button';
import TextField from '../../../components/ui/TextField';

const USERNAME_REGEX = /^[a-zA-Z0-9_-]{3,20}$/;
const PASSWORD_MIN = 8;
const PASSWORD_MAX = 72;

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
  // Empêche un double-clic d'envoyer deux requêtes en parallèle
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showWarning } = useNotification();

  const { setAuth } = useAuth();

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const data = await login(email, password);
      setAuth(data.user, data.accessToken, { isNewLogin: true });
      onClose();
    } catch (err) {
      const tooMany = err instanceof Error && err.message === 'TOO_MANY_ATTEMPTS';
      showWarning(
        t(tooMany ? 'authModal.errors.tooManyAttempts' : 'authModal.errors.invalidCredentials')
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    // mêmes règles que le backend (backend/src/users/dto/validation-rules.ts)
    if (!USERNAME_REGEX.test(username)) {
      showWarning(t('authModal.errors.invalidUsername'));
      return;
    }

    if (password.length < PASSWORD_MIN || password.length > PASSWORD_MAX) {
      showWarning(t('authModal.errors.passwordLength'));
      return;
    }

    if (password !== confirmPassword) {
      showWarning(t('authModal.errors.passwordMismatch'));
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });

      if (res.status === 429) {
        showWarning(t('authModal.errors.tooManyAttempts'));
        return;
      }
      if (!res.ok) throw new Error();

      // Clear the form after successful registration
      setUsername('');
      setPassword('');
      setConfirmPassword('');

      setView('login');
    } catch {
      showWarning(t('authModal.errors.registrationError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ModalLayout
      onClose={onClose}
      title={view === 'login' ? t('authModal.loginTitle') : t('authModal.registerTitle')}
      size="sm"
      embedded={embedded}
      variant={embedded ? 'sheet' : 'menu'}
    >
      {view === 'login' ? (
        <div>
          <form className="flex flex-col gap-3" onSubmit={handleLoginSubmit}>
            <TextField
              type="email"
              placeholder={t('authModal.email')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <TextField
              type="password"
              placeholder={t('authModal.password')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <Button variant="ghost" type="submit" disabled={isSubmitting}>
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
          <form className="flex flex-col gap-3" onSubmit={handleRegisterSubmit}>
            <TextField
              type="email"
              placeholder={t('authModal.email')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <TextField
              type="text"
              placeholder={t('authModal.username')}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />

            <TextField
              type="password"
              placeholder={t('authModal.password')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <TextField
              type="password"
              placeholder={t('authModal.confirmPassword')}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            <Button
              variant="primary"
              type="submit"
              disabled={isSubmitting}
              className="mt-2 p-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
    </ModalLayout>
  );
}
