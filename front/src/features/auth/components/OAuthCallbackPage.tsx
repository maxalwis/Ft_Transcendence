import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../context/auth/useAuth';
import { useNotification } from '../../../context/notifications/useNotification';
import { refresh } from '../../../api/api';

// codes envoyés par le backend (OAuthExceptionFilter)
const OAUTH_ERRORS = ['account_exists', 'oauth_failed'];

export default function OAuthCallbackPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setAuth } = useAuth();
  const { showWarning } = useNotification();
  const error = searchParams.get('error');

  useEffect(() => {
    if (error) {
      const code = OAUTH_ERRORS.includes(error) ? error : 'oauth_failed';
      showWarning(t(`oauth.errors.${code}`));
      navigate('/', { replace: true });
      return;
    }

    (async () => {
      try {
        const { accessToken, user } = await refresh();
        setAuth(user, accessToken, { isNewLogin: true });
        navigate('/', { replace: true });
      } catch {
        navigate('/', { replace: true });
      }
    })();
  }, [error, navigate, setAuth, showWarning, t]);

  return (
    <div className="min-h-screen flex items-center justify-center">{t('oauth.connecting')}</div>
  );
}
