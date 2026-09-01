// src/features/auth/components/AuthModal.tsx
import { useState } from 'react';
import { useAuth } from '../../../context/auth/AuthContext';
import { login } from '../../../api/api';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [view, setView] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { setAuth } = useAuth();

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const data = await login(email, password); // Automatically updates setAccessToken inside api.ts
      setAuth(data.user, data.accessToken);
      onClose();
    } catch {
      setError('Invalid credentials');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError('Non matching passwords');
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
      setError('Erreur lors de la création du compte');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs">
      <div className="relative border-2 p-8 rounded-lg border-orange-500 bg-white max-w-md w-full shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-black text-xl font-bold cursor-pointer"
        >
          ✕
        </button>

        {view === 'login' ? (
          <div>
            <h1 className="font-extrabold text-2xl mb-4 text-center">Sign in</h1>
            {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
            <form className="flex flex-col gap-3" onSubmit={handleLoginSubmit}>
              <input
                className="glass-panel p-2 rounded-lg border-2"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <input
                className="glass-panel p-2 rounded-lg border-2"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button className="mt-2 p-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-semibold cursor-pointer">
                Log in
              </button>
            </form>

            <div className="flex justify-center gap-2 mt-4">
              <button
                onClick={() =>
                  (window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`)
                }
                className="glass-panel p-2 rounded-md"
              >
                <img
                  src="https://img.icons8.com/?size=25&id=17949&format=png&color=000000"
                  alt="Google"
                />
              </button>
              <button
                onClick={() => (window.location.href = `${import.meta.env.VITE_API_URL}/auth/42`)}
                className="glass-panel p-2 rounded-md"
              >
                <img src="https://cdn.simpleicons.org/42?viewbox=auto&size=20" alt="42" />
              </button>
            </div>

            <p className="text-center text-sm mt-4">
              No account?{' '}
              <button
                className="text-amber-600 hover:underline cursor-pointer"
                onClick={() => setView('register')}
              >
                Create one
              </button>
            </p>
          </div>
        ) : (
          <div>
            <h1 className="font-extrabold text-2xl mb-4 text-center">Create Account</h1>
            {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
            <form className="flex flex-col gap-3" onSubmit={handleRegisterSubmit}>
              <input
                className="glass-panel p-2 rounded-lg border-2"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <input
                className="glass-panel p-2 rounded-lg border-2"
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <input
                className="glass-panel p-2 rounded-lg border-2"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <input
                className="glass-panel p-2 rounded-lg border-2"
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <button className="mt-2 p-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-semibold cursor-pointer">
                Register
              </button>
            </form>

            <p className="text-center text-sm mt-4">
              Already have an account?{' '}
              <button
                className="text-amber-600 hover:underline cursor-pointer"
                onClick={() => setView('login')}
              >
                Sign in
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
