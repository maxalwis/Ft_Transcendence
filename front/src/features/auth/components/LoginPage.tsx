import { useState } from 'react';
import type { SubmitEvent } from 'react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: SubmitEvent) => {
    e.preventDefault();
    // logique de connexion username/mdp — a brancher plus tard sur le backend
  };

  const handleGoogleLogin = () => {
    window.location.href =
      'https://accounts.google.com/o/oauth2/auth?client_id=513700796427-64gvloa5ugr6ugebfne104u5v44u1en7.apps.googleusercontent.com&redirect_uri=https://localhost:8443&response_type=code&scope=email%20profile';
  };

  const handle42Login = () => {
    window.location.href =
      'https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-eafc486920117f3b35ec72b7d5397bd65f1a26b0a04ba905103413815298e2f7&redirect_uri=https%3A%2F%2Flocalhost%3A8443&response_type=code';
  };

  const home = () => {
    window.location.href = `https://localhost:${import.meta.env.HTTPS_PORT || 8443}/`;
  };

  const register = () => {
    window.location.href = `https://localhost:${import.meta.env.HTTPS_PORT || 8443}/register/`;
  };

  return (
    <div className="min-h-screen bg-gray-900 rounded-sm border-2 flex flex-col justify-center items-center">
      <div className="border-2 p-10 rounded-sm border-orange-500 bg-white">
        <h1 className="font-extrabold text-3xl">Sign in to your account</h1>

        <form className="flex flex-col p-4" onSubmit={handleSubmit}>
          <label className="mb-1 mt-3" htmlFor="username">
            {' '}
            Username{' '}
          </label>
          <input
            className="glass-panel pl-2 flex items-center jutify-center rounded-2xl border-2"
            type="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
          />

          <label className="mb-1 mt-3" htmlFor="password">
            {' '}
            Password{' '}
          </label>
          <input
            className="glass-panel pl-2 flex items-center jutify-center rounded-lg border-2"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
          />
          <button
            className="mt-4 flex hover:scale-105 items-center glass-panel justify-center duration-500 ease-in-out hover:text-white hover:border-white/50 hover:bg-linear-to-r! from-teal-400 to-orange-300 cursor-pointer"
            type="submit"
          >
            Log in
          </button>
        </form>

        <div className="flex items-center justify-center gap-2">
          <button
            className="glass-panel hover:scale-3d ease-in p-2 h-11 w-11 flex justify-center items-center cursor-pointer"
            onClick={handleGoogleLogin}
          >
            <img src="https://img.icons8.com/?size=25&id=17949&format=png&color=000000"></img>
          </button>
          <button
            className="glass-panel hover:scale-3d ease-in p-2 h-11 w-11 flex justify-center items-center cursor-pointer"
            onClick={handle42Login}
          >
            <img src="https://cdn.simpleicons.org/42?viewbox=auto&size=20"></img>
          </button>
          <button
            className="glass-panel hover:scale-3d ease-in p-2 h-11 w-11 cursor-pointer flex justify-center items-center"
            onClick={home}
          >
            <img src="https://img.icons8.com/?size=25&id=83326&format=png&color=000000"></img>
          </button>
        </div>
        <div className="flex items-center justify-center gap-2 text-sm pt-4">
          No account ?
          <button
            className="flex items-center justify-center hover:underline cursor-pointer text-sm text-amber-600"
            onClick={register}
          >
            Create an account
          </button>
        </div>
      </div>
    </div>
  );
}
