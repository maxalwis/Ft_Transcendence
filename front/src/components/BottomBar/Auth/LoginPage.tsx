import { useState } from 'react';
import type { SubmitEvent } from 'react';
import { useNavigate } from "react-router-dom";

export default function LoginPage()
{
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');

	const handleSubmit = (e: SubmitEvent) => {
		e.preventDefault();
	// logique de connexion username/mdp — a brancher plus tard sur le backend
	};

	const handleGoogleLogin = () => {
		window.location.href = "URL_AUTORISATION_GOOGLE";
	};

	const handle42Login = () => {
		window.location.href = "URL_AUTORISATION_42";
	};

	const navigate = useNavigate();
	const gohome = () => {
		navigate(-1);
	};

	return (
	<div className='min-h-screen bg-gray-100 rounded-sm border-2 flex flex-col justify-center items-center'>
		<div className='border-2 p-10 rounded-sm border-orange-500'>
			<h1 className='font-extrabold text-3xl'>Sign in to your account</h1>

			<form
				className='flex flex-col p-4'
				onSubmit={handleSubmit}>

				<label
					className='mb-1 mt-3'
					htmlFor="username"> Username </label>
				<input
					className='glassmorphism-popup pl-2 flex items-center jutify-center rounded-2xl border-2'
					type="text"
					value={username}
					onChange={(e) => setUsername(e.target.value)}
					placeholder="Username"/>
				<label
					className='mb-1 mt-3'
					htmlFor="password"> Password </label>

				<input
					className='glassmorphism-popup pl-2 flex items-center jutify-center rounded-lg border-2'
					type="password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					placeholder="Password"/>
			<button
				className="mt-4 flex items-center glassmorphism-popup justify-center duration-500 ease-in-out hover:text-white hover:border-white/90 hover:bg-linear-to-r! from-teal-400 to-orange-300 cursor-pointer"
				type="submit">Log in</button>
			</form>
	
			<div className='flex items-center justify-center gap-2'>
				<button
					className='glassmorphism-popup p-1 cursor-pointer'
					onClick={handleGoogleLogin}>Google</button>
				<button
					className='glassmorphism-popup p-1 cursor-pointer'
					onClick={handle42Login}>42</button>
				<button
					className='glassmorphism-popup p-1 cursor-pointer'
					onClick={gohome}>Go back</button>
			</div>

		</div>
	</div>
	);
}
