import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../context/auth/useAuth';
import { resolveAvatarUrl } from '../utils/avatar';
import PasswordModal from './PasswordModal';
import styles from '../ProfileModal.module.css';
import { useNotification } from '../../../context/notifications/useNotification';
import ModalLayout, { type ModalShellProps } from '../../../components/ui/ModalLayout';
import Button from '../../../components/ui/Button';

interface EditProfileContentProps {
  onClose: () => void;
  shell?: ModalShellProps;
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

export default function EditProfileContent({ onClose, shell }: EditProfileContentProps) {
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

      const res = await fetch(`https://localhost:${import.meta.env.VITE_HTTPS_PORT}/api/users/me`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
      });

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
    <ModalLayout onClose={onClose} title={t('profileSettings.title')} {...shell}>
      <form onSubmit={handleSubmit} className="modalForm">
        <div className={styles.avatarPicker}>
          <Button
            variant="flag"
            type="button"
            className={`${styles.avatarPreview} w-15! h-15! mb-2`}
            onClick={() => fileInputRef.current?.click()}
          >
            {avatarPreview ? (
              <img src={avatarPreview} alt="Avatar" />
            ) : (
              <span>{username.charAt(0).toUpperCase() || '?'}</span>
            )}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            hidden
          />

          <Button
            variant="ghost"
            type="button"
            className={styles.avatarChangeLink}
            onClick={() => fileInputRef.current?.click()}
          >
            {t('profileSettings.changePicture')}
          </Button>
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
          <Button variant="secondary" type="button" onClick={() => setIsPasswordModalOpen(true)}>
            {t('profileSettings.changePassword')}
          </Button>
        )}

        <div className="modalActions">
          <Button variant="secondary" onClick={onClose}>
            {t('profileSettings.cancel')}
          </Button>

          <Button variant="primary" type="submit" disabled={isSaving}>
            {isSaving ? t('profileSettings.saving') : t('profileSettings.save')}
          </Button>
        </div>
      </form>

      {isPasswordModalOpen && <PasswordModal onClose={() => setIsPasswordModalOpen(false)} />}
    </ModalLayout>
  );
}
