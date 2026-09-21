import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../context/auth/useAuth';
import { resolveAvatarUrl } from '../utils/avatar';
import PasswordModal from './PasswordModal';
import styles from '../ProfileModal.module.css';
import { useNotification } from '../../../context/notifications/useNotification';

interface EditProfileContentProps {
  onClose: () => void;
}

const languageOptions = [
  { value: 'FR', label: 'Français' },
  { value: 'EN', label: 'English' },
  { value: 'ES', label: 'Español' },
  { value: 'AR', label: 'العربية' },
] as const;

type PreferredLanguage = (typeof languageOptions)[number]['value'];

const categoryOptions = ['MUSIC', 'CULTURE', 'WORKSHOPS', 'LEISURE', 'OTHERS'] as const;
type PreferredCategory = (typeof categoryOptions)[number];

export default function EditProfileContent({ onClose }: EditProfileContentProps) {
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
  const [avatarPreview, setAvatarPreview] = useState<string | null>(resolveAvatarUrl(user?.avatar));
  const [isSaving, setIsSaving] = useState(false);
  const { showWarning } = useNotification();
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const isOAuthUser = Boolean(user?.provider && user.provider !== 'local');

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setAvatarFile(file);

    if (file) {
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const formData = new FormData();

      formData.append('username', username);

      if (preferredLanguage) {
        formData.append('preferredLanguage', preferredLanguage);
      }

      if (preferredCategory) {
        formData.append('preferredCategory', preferredCategory);
      }

      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }

      const res = await fetch(
        `https://localhost:${import.meta.env.VITE_HTTPS_PORT}/api/users/${user?.id}`,
        {
          method: 'PUT',
          credentials: 'include',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          body: formData,
        }
      );

      if (!res.ok) {
        throw new Error('Échec de la mise à jour');
      }

      const updated = await res.json();

      updateUser(updated);
      onClose();
    } catch {
      showWarning(t('profileSettings.saveError', 'Unable to save changes.'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <div className={styles.modalHeader}>
        <h2>{t('profileSettings.title')}</h2>

        <button
          type="button"
          className="modal-button modal-close"
          onClick={onClose}
          aria-label="Fermer"
        >
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form onSubmit={handleSubmit} className={styles.modalForm}>
        <div className={styles.avatarPicker}>
          <button
            type="button"
            className={styles.avatarPreview}
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
            className={styles.avatarChangeLink}
            onClick={() => fileInputRef.current?.click()}
          >
            {t('profileSettings.changePicture')}
          </button>
        </div>

        <label>
          {t('profileSettings.username')}
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
        </label>

        <label>
          {t('profileSettings.preferredLanguage')}
          <select
            value={preferredLanguage}
            onChange={(e) => setPreferredLanguage(e.target.value as PreferredLanguage)}
          >
            <option value="">{t('profileSettings.choose')}</option>

            {languageOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          {t('profileSettings.preferredCategory')}
          <select
            value={preferredCategory}
            onChange={(e) => setPreferredCategory(e.target.value as PreferredCategory)}
          >
            <option value="">{t('profileSettings.choose')}</option>

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
            className={styles.btnSecondary}
            onClick={() => setIsPasswordModalOpen(true)}
          >
            {t('profileSettings.changePassword')}
          </button>
        )}

        <div className={styles.modalActions}>
          <button type="button" className={styles.btnSecondary} onClick={onClose}>
            {t('profileSettings.cancel')}
          </button>

          <button type="submit" className={styles.btnPrimary} disabled={isSaving}>
            {isSaving ? t('profileSettings.saving') : t('profileSettings.save')}
          </button>
        </div>
      </form>

      {isPasswordModalOpen && <PasswordModal onClose={() => setIsPasswordModalOpen(false)} />}
    </>
  );
}
