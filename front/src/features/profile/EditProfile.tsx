import { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../../context/auth/AuthContext';
import './Modal.css';

interface EditProfileProps {
  onClose: () => void;
}

export default function EditProfile({ onClose }: EditProfileProps) {
  const { user, updateUser } = useAuth();
  const [username, setUsername] = useState(user?.username ?? '');
  const [preferredLanguage, setPreferredLanguage] = useState('');
  const [preferredCategory, setPreferredCategory] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatarUrl ?? null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isOAuthUser = Boolean(user?.provider && user.provider !== 'local');

  const languageOptions = ['Français', 'Anglais', 'Espagnol'];
  const categoryOptions = ['Culture', 'Sports', 'Musique', 'Famille'];

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setAvatarFile(file);
    if (file) setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('username', username);
      if (preferredLanguage) formData.append('preferredLanguage', preferredLanguage);
      if (preferredCategory) formData.append('preferredCategory', preferredCategory);
      if (avatarFile) formData.append('avatar', avatarFile);

      const res = await fetch(
        `https://localhost:${import.meta.env.VITE_HTTPS_PORT}/api/user/profile`,
        {
          method: 'PATCH',
          credentials: 'include',
          body: formData,
        }
      );

      if (!res.ok) throw new Error('Échec de la mise à jour');

      const updated = await res.json();
      updateUser(updated);
      onClose();
    } catch (err) {
      setError('Impossible de sauvegarder les modifications');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    if (newPassword.length < 8) {
      setPasswordError('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Les mots de passe ne correspondent pas.');
      return;
    }

    setIsChangingPassword(true);

    try {
      // TODO: brancher l'appel API réel quand la route backend sera disponible.
      setIsPasswordModalOpen(false);
      setNewPassword('');
      setConfirmPassword('');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const modal = (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass-panel" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Modifier le profil</h2>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Fermer">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="avatar-picker">
            <button
              type="button"
              className="avatar-preview"
              onClick={() => fileInputRef.current?.click()}
            >
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar" />
              ) : (
                <span>{username.charAt(0).toUpperCase() || '?'}</span>
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              hidden
            />
            <button
              type="button"
              className="avatar-change-link"
              onClick={() => fileInputRef.current?.click()}
            >
              Changer photo
            </button>
          </div>

          <label>
            Pseudo
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
          </label>

          <label>
            Langue préférée
            <select
              value={preferredLanguage}
              onChange={(e) => setPreferredLanguage(e.target.value)}
            >
              <option value="">Choisir</option>
              {languageOptions.map((language) => (
                <option key={language} value={language}>
                  {language}
                </option>
              ))}
            </select>
          </label>

          <label>
            Catégorie préférée
            <select
              value={preferredCategory}
              onChange={(e) => setPreferredCategory(e.target.value)}
            >
              <option value="">Choisir</option>
              {categoryOptions.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>

          {!isOAuthUser && (
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setIsPasswordModalOpen(true)}
            >
              Modifier le mot de passe
            </button>
          )}

          {error && <p className="modal-error">{error}</p>}

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Annuler
            </button>
            <button type="submit" className="btn-primary" disabled={isSaving}>
              {isSaving ? 'Sauvegarde...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const passwordModal = isPasswordModalOpen ? (
    <div className="modal-overlay password-modal-overlay" onClick={() => setIsPasswordModalOpen(false)}>
      <div className="modal-content glass-panel" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Changer le mot de passe</h2>
          <button
            type="button"
            className="modal-close"
            onClick={() => setIsPasswordModalOpen(false)}
            aria-label="Fermer"
          >
            ×
          </button>
        </div>

        <form onSubmit={handlePasswordSubmit} className="password-form">
          <label>
            Nouveau mot de passe
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Nouveau mot de passe"
            />
          </label>

          <label>
            Confirmer le nouveau mot de passe
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirmer le mot de passe"
            />
          </label>

          {passwordError && <p className="modal-error">{passwordError}</p>}

          <div className="modal-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setIsPasswordModalOpen(false)}
            >
              Annuler
            </button>
            <button type="submit" className="btn-primary" disabled={isChangingPassword}>
              {isChangingPassword ? 'Chargement...' : 'Changer le mot de passe'}
            </button>
          </div>
        </form>
      </div>
    </div>
  ) : null;

  return createPortal(
    <>
      {modal}
      {passwordModal}
    </>,
    document.body
  );
}
