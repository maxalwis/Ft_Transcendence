import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/auth/AuthContext';
import { refresh } from '../../../api/api';

export default function OAuthCallbackPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuth();

  useEffect(() => {
    (async () => {
      try {
        const { accessToken, user } = await refresh();
        setAuth(user, accessToken);
        navigate('/');
      } catch {
        navigate('/login');
      }
    })();
  }, []);

  return <div className="min-h-screen flex items-center justify-center">Connexion en cours...</div>;
}
