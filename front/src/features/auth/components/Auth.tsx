// import { useAuth } from '../../../context/auth/AuthContext.tsx';
// import { useNavigate } from 'react-router-dom';
// import { useState } from 'react';

// export default function LoginButton() {
// 	const { user, logout } = useAuth();
// 	const navigate = useNavigate();

// 	const [isMenuOpen, setIsMenuOpen] = useState(false);
// 	const [isEditOpen, setIsEditOpen] = useState(false);

// 	const handleLogin = () => {
// 	window.location.href = `https://localhost:${import.meta.env.VITE_HTTPS_PORT}/login/`;
// 	};

// 	const handleLogout = async () => {
// 	try {
// 		await fetch(`https://localhost:${import.meta.env.VITE_HTTPS_PORT}/api/auth/logout`, {
// 		method: 'POST',
// 		credentials: 'include',
// 		});
// 	} catch {
// 		// on ignore une éventuelle erreur réseau, on déconnecte quand même côté client
// 	} finally {
// 		logout();
// 	}
// 	};

// 	if (user) {
// 	return (
// 		<button
// 		className="h-10 w-25 glass-panel flex items-center justify-center cursor-pointer duration-300 hover:zoom-98"
// 		onClick={handleLogout}
// 		>
// 		Logout
// 		</button>
// 	);
// 	}

// 	return (
// 	<button
// 		className=" h-10 w-25 glass-panel flex items-center justify-center cursor-pointer duration-300 hover:zoom-98"
// 		onClick={handleLogin}
// 	>
// 		Connexion
// 	</button>
// 	);

import { useAuth } from '../../../context/auth/AuthContext.tsx';
import { useState, useRef, useEffect } from 'react';
import EditProfile from '../../profile/EditProfile.tsx';

export default function LoginButton()
{
	const { user, logout } = useAuth();

	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [isEditOpen, setIsEditOpen] = useState(false);
	const menuRef = useRef<HTMLDivElement>(null);

	// ferme le dropdown si on clique en dehors
	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
				setIsMenuOpen(false);
			}
		}
		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, []);

	const handleLogin = () => {
		window.location.href = `https://localhost:${import.meta.env.VITE_HTTPS_PORT}/login/`;
	};

	const handleLogout = async () => {
		try {
			await fetch(`https://localhost:${import.meta.env.VITE_HTTPS_PORT}/api/auth/logout`, {
				method: 'POST',
				credentials: 'include',
			});
		} catch {
			// on ignore une éventuelle erreur réseau, on déconnecte quand même côté client
		} finally {
			logout();
			setIsMenuOpen(false);
		}
	};

	if (user) {
		return (
			<div className="relative"
				 ref={menuRef}>
				<button
					className="h-10 w-25 glass-panel flex items-center justify-center cursor-pointer duration-300 hover:zoom-98"
					onClick={() => {
						setIsMenuOpen((prev) => !prev);
						console.log('clicked, isMenuOpen avant:', isMenuOpen);
					}}
					>

					{user.username ?? 'Profil'}
				</button>

				{isMenuOpen && (
					<div className="absolute right-0 top-full mt-2 glass-panel flex flex-col min-w-40 z-1000">
						<button
							className="px-4 py-2 text-left hover:bg-white/10"
							onClick={() => {
								setIsEditOpen(true);
								setIsMenuOpen(false);
							}}
						>
							Modifier le profil
						</button>
						<button
							className="px-4 py-2 text-left hover:bg-white/10"
							onClick={handleLogout}
						>
							Logout
						</button>
					</div>
				)}

				{isEditOpen && (
					<EditProfile onClose={() => setIsEditOpen(false)} />
				)}
			</div>
		);
	}

	return (
		<button
			className="h-10 w-25 glass-panel flex items-center justify-center cursor-pointer duration-300 hover:zoom-98"
			onClick={handleLogin}
		>
			Connexion
		</button>
	);
}
