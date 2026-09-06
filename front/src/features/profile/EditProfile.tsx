import { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/auth/AuthContext';
import { resolveAvatarUrl } from './utils/avatar';
import PasswordModal from './PasswordModal';
import './Modal.css';

interface EditProfileProps {
  onClose: () => void;
}

const languageOptions = [
  { value: 'FR', label: 'Français' },
  { value: 'EN', label: 'English' },
  { value: 'ES', label: 'Español' },
] as const;
type PreferredLanguage = (typeof languageOptions)[number]['value'];

const categoryOptions = ['MUSIC', 'CULTURE', 'WORKSHOPS', 'LEISURE', 'OTHERS'] as const;
type PreferredCategory = (typeof categoryOptions)[number];

export default function EditProfile({ onClose }: EditProfileProps) {
  const { t } = useTranslation();
  const { user, updateUser, accessToken } = useAuth();
  const [username, setUsername] = useState(user?.username ?? '');
  const [preferredLanguage, setPreferredLanguage] = useState<PreferredLanguage | ''>(
    user?.preferredLanguage ?? ''
  );
  const [preferredCategory, setPreferredCategory] = useState<PreferredCategory | ''>(
    user?.preferredCategory ?? ''
  );
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    resolveAvatarUrl(user?.avatar)
  );
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isOAuthUser = Boolean(user?.provider && user.provider !== 'local');

  const requestClose = () => setIsClosing(true);

  const handleAnimationEnd = () => {
    if (isClosing) onClose();
  };

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
        `https://localhost:${import.meta.env.VITE_HTTPS_PORT}/api/users/${user?.id}`,
        {
          method: 'PUT',
          credentials: 'include',
          headers: {
            'Authorization': `Bearer ${accessToken}`
          },
          body: formData,
        }
      );

      if (!res.ok) throw new Error('Échec de la mise à jour');

      const updated = await res.json();
      updateUser(updated);
      requestClose();
    } catch (err) {
      setError('Impossible de sauvegarder les modifications');
    } finally {
      setIsSaving(false);
    }
  };

  const modal = (
    <div className="modal-overlay profileModalOverlay" onClick={requestClose}>
      <div
        data-state={isClosing ? 'closed' : 'open'}
        onAnimationEnd={handleAnimationEnd}
        className="profileModal profileModalContent glass-panel"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="profileModalHeader">
          <h2>Modifier le profil</h2>
          <button
            type="button"
            className="profileModalClose"
            onClick={requestClose}
            aria-label="Fermer"
          >
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
              onChange={(e) => setPreferredLanguage(e.target.value as PreferredLanguage)}
            >
              <option value="">Choisir</option>
              {languageOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>

          <label>
            Catégorie préférée
            <select
              value={preferredCategory}
              onChange={(e) => setPreferredCategory(e.target.value as PreferredCategory)}
            >
              <option value="">Choisir</option>
              {categoryOptions.map((code) => (
                <option key={code} value={code}>
                  {t(`categories.${code.toLowerCase()}`)}
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
            <button type="button" className="btn-secondary" onClick={requestClose}>
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

  return createPortal(
    <>
      {modal}
      {isPasswordModalOpen && <PasswordModal onClose={() => setIsPasswordModalOpen(false)} />}
    </>,
    document.body
  );
}
