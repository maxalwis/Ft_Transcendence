import { useState } from 'react';
import type { SubmitEvent } from 'react';

export default function RegisterPage() {
	const [email, setEmail] = useState('');
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [error, setError] = useState('');

	const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
	e.preventDefault();
	setError('');

	if (password !== confirmPassword) {
		setError('Les mots de passe ne correspondent pas');
		return;
	}

	try {
		const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/register`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		credentials: 'include', // pour que le cookie soit géré correctement si besoin
		body: JSON.stringify({ username, password, email }),
		});

		if (!response.ok) {
		const data = await response.json();
		setError(data.message || 'Erreur lors de la création du compte');
		return;
		}

		// succès → redirection vers login, ou connexion automatique
		window.location.href = '/login';
	} catch (err) {
		setError('Impossible de contacter le serveur');
	}
	};

	const login = () => {
	window.location.href = `https://localhost:${import.meta.env.VITE_HTTPS_PORT}/login/`;
	// window.location.href = "http://localhost:5173/login";
	};

	return (
	<div className="min-h-screen bg-gray-900 rounded-sm border-2 flex flex-col justify-center items-center">
		<div className="border-2 p-10 rounded-sm border-orange-500 bg-white">
		<h1 className="font-extrabold text-3xl">Create an account</h1>

		<form className="flex flex-col p-4" onSubmit={handleSubmit}>
			<label className="mb-1 mt-3" htmlFor="email">
			{' '}
			Email{' '}
			</label>
			<input
				id="email"
				className="glass-panel pl-2 flex items-center jutify-center rounded-2xl border-2"
				type="email"
				value={email}
				onChange={(e) => setEmail(e.target.value)}
				placeholder="Email"
			/>

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
			<label className="mb-1 mt-3" htmlFor="password">
			Confirm Password{' '}
			</label>
			<input
				className="glass-panel pl-2 flex items-center jutify-center rounded-lg border-2"
				type="password"
				value={confirmPassword}
				onChange={(e) => setConfirmPassword(e.target.value)}
				placeholder="Confirm Password"
			/>

			{error && (
			<p className="mt-2 text-sm! text-red-500!" aria-live="polite">
				{error}
			</p>
			)}
			<button
			className="mt-4 flex hover:scale-105 items-center glass-panel justify-center duration-500 ease-in-out hover:text-white hover:border-white/50 hover:bg-linear-to-r! from-teal-400 to-orange-300 cursor-pointer"
			type="submit"
			>
			Create account
			</button>
		</form>

		<div className="flex items-center justify-center gap-2 text-sm pt-2">
			Already have an account ?
			<button
				className="flex items-center justify-center hover:underline cursor-pointer text-sm text-amber-600"
				onClick={login}
			>
			Sign in
			</button>
		</div>
		</div>
	</div>
	);
}
