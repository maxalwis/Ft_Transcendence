import { useState, FormEvent } from 'react';
import { useAuth } from '../../../context/AuthContext';

interface RegisterProps {
  onClose?: () => void;
  onSwitchToLogin?: () => void;
}

export default function RegisterPage({ onClose, onSwitchToLogin }: RegisterProps) {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const { setAuth } = useAuth();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Non matching passwords');
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // pour que le cookie soit géré correctement si besoin
        body: JSON.stringify({ username, password, email }),
      });

      const data = await response.json();

      if (!response.ok) {
        const data = await response.json();
        setError(data.message || 'Error while creating account');
        return;
      }

      if (data.user && data.accessToken) {
        setAuth(data.user, data.accessToken);
        if (onClose) onClose();
      } else if (onSwitchToLogin) {
        // Otherwise switch modal view to login tab without reloading
        onSwitchToLogin();
      }
    } catch (err) {
      setError('Contact to the server impossible');
    }
  };

  return (
    <div className="flex flex-col justify-center items-center">
      <div className="p-6 bg-white rounded-lg w-full max-w-md">
        <h1 className="font-extrabold text-3xl mb-4">Create an account</h1>

        {error && (
          <div className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 text-sm rounded">
            {error}
          </div>
        )}

        <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            className="pl-2 py-2 rounded-lg border-2"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
          />

          <label htmlFor="username">Username</label>
          <input
            id="username"
            className="pl-2 py-2 rounded-lg border-2"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            required
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            className="pl-2 py-2 rounded-lg border-2"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
          />

          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            id="confirmPassword"
            className="pl-2 py-2 rounded-lg border-2"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm Password"
            required
          />

          <button
            className="mt-4 py-2 hover:scale-105 transition-all rounded-lg bg-teal-500 text-white font-bold cursor-pointer"
            type="submit"
          >
            Create account
          </button>
        </form>

        <div className="flex items-center justify-center gap-2 text-sm pt-4">
          Already have an account?
          <button
            type="button"
            className="hover:underline cursor-pointer text-amber-600 font-semibold"
            onClick={onSwitchToLogin}
          >
            Sign in
          </button>
        </div>
      </div>
    </div>
  );
}
