import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../context/auth/useAuth';
import { refresh } from '../../../api/api';

export default function OAuthCallbackPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setAuth } = useAuth();

  useEffect(() => {
    (async () => {
      try {
        const { accessToken, user } = await refresh();
        setAuth(user, accessToken);
        navigate('/', { replace: true });
      } catch {
        navigate('/', { replace: true });
      }
    })();
  }, [navigate, setAuth]);

  return (
    <div className="min-h-screen flex items-center justify-center">{t('oauth.connecting')}</div>
  );
}
