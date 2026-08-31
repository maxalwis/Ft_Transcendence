import { useState } from 'react';
import { useAuth } from '../../context/auth/AuthContext';

interface EditProfileProps {
	onClose: () => void;
}

export default function EditProfile({ onClose }: EditProfileProps) {
	const { user, updateUser } = useAuth(); // selon ce que ton contexte expose
	const [username, setUsername] = useState(user?.username ?? '');
	const [avatarFile, setAvatarFile] = useState<File | null>(null);
	const [isSaving, setIsSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSaving(true);
		setError(null);

		try {
			const formData = new FormData();
			formData.append('username', username);
			if (avatarFile) formData.append('avatar', avatarFile);

			const res = await fetch(`https://localhost:${import.meta.env.VITE_HTTPS_PORT}/api/user/profile`, {
				method: 'PATCH',
				credentials: 'include',
				body: formData,
			});

			if (!res.ok) throw new Error('Échec de la mise à jour');

			const updated = await res.json();
			updateUser(updated); // met à jour le contexte
			onClose();
		} catch (err) {
			setError('Impossible de sauvegarder les modifications');
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<div className="modal-overlay" onClick={onClose}>
			<div className="modal-content" onClick={(e) => e.stopPropagation()}>
				<h2>Modifier le profil</h2>

				<form onSubmit={handleSubmit}>
					<label>
						Pseudo
						<input
							type="text"
							value={username}
							onChange={(e) => setUsername(e.target.value)}
						/>
					</label>

					<label>
						Avatar
						<input
							type="file"
							accept="image/*"
							onChange={(e) => setAvatarFile(e.target.files?.[0] ?? null)}
						/>
					</label>

					{error && <p className="text-red-500">{error}</p>}

					<div className="flex gap-2 mt-4">
						<button type="submit" disabled={isSaving}>
							{isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
						</button>
						<button type="button" onClick={onClose}>
							Annuler
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}