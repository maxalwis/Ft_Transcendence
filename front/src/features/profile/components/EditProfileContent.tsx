import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../context/auth/useAuth';
import { resolveAvatarUrl } from '../utils/avatar';
import PasswordModal from './PasswordModal';
import { exportMyData, requestAccountDeletion } from '../../../api/gdpr';
import styles from '../ProfileModal.module.css';
import { useNotification } from '../../../context/notifications/useNotification';
import ModalLayout, { type ModalShellProps } from '../../../components/ui/ModalLayout';
import Button from '../../../components/ui/Button';
import TextField from '../../../components/ui/TextField';
import Select from '../../../components/ui/Select';
import { updateProfile } from '../../../api/users';
import { useApiErrorMessage } from '../../../hooks/useApiErrorMessage';

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
  const [avatarPreview, setAvatarPreview] = useState<string>(resolveAvatarUrl(user?.avatar));
  const [avatarLoadFailed, setAvatarLoadFailed] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { showWarning, showSuccess } = useNotification();
  const errorMessage = useApiErrorMessage();
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const isOAuthUser = Boolean(user?.provider && user.provider !== 'local');

  // GDPR: download all of the user's data as a JSON file
  const handleExportData = async () => {
    if (!accessToken) return;
    try {
      const data = await exportMyData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'my-data.json';
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      showWarning(t('profileSettings.exportError'));
    }
  };

  // GDPR: ask the backend to email a deletion-confirmation link
  const handleDeleteRequest = async () => {
    if (!accessToken) return;
    try {
      await requestAccountDeletion();
      showSuccess(t('profileSettings.deleteEmailSent'));
    } catch {
      showWarning(t('profileSettings.deleteRequestError'));
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setAvatarFile(file);

    if (file) {
      setAvatarPreview(URL.createObjectURL(file));
      setAvatarLoadFailed(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const updated = await updateProfile({
        username,
        preferredLanguage: preferredLanguage || undefined,
        preferredCategory: preferredCategory || undefined,
        avatar: avatarFile ?? undefined,
      });

      updateUser(updated);
      showSuccess(t('profileSettings.saveSuccess'));
      onClose();
    } catch (err) {
      showWarning(errorMessage(err, t('profileSettings.saveError', 'Unable to save changes.')));
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
            {avatarLoadFailed ? (
              <span>{username.charAt(0).toUpperCase() || '?'}</span>
            ) : (
              <img
                src={avatarPreview}
                alt={t('profileSettings.avatarAlt')}
                onError={() => setAvatarLoadFailed(true)}
              />
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

        <TextField
          label={t('profileSettings.username')}
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <Select
          label={t('profileSettings.preferredLanguage')}
          value={preferredLanguage}
          onChange={(val) => setPreferredLanguage(val as PreferredLanguage)}
          placeholder={t('profileSettings.choose')}
          options={languageOptions.map((opt) => ({
            value: opt.value,
            label: opt.label,
          }))}
        />

        <Select
          label={t('profileSettings.preferredCategory')}
          value={preferredCategory}
          onChange={(val) => setPreferredCategory(val as PreferredCategory)}
          placeholder={t('profileSettings.choose')}
          options={categoryOptions.map((code) => ({
            value: code,
            label: t(`categories.${code.toLowerCase()}`),
          }))}
        />

        {!isOAuthUser && (
          <Button variant="ghost" type="button" onClick={() => setIsPasswordModalOpen(true)}>
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

        <div className={styles.privacySection}>
          <h3 className={styles.privacyTitle}>{t('profileSettings.privacyTitle')}</h3>
          <div className={styles.privacyButtons}>
            <Button variant="secondary" type="button" onClick={handleExportData}>
              {t('profileSettings.downloadData')}
            </Button>
            <Button variant="danger" type="button" onClick={handleDeleteRequest}>
              {t('profileSettings.deleteAccount')}
            </Button>
          </div>
        </div>
      </form>

      {isPasswordModalOpen && <PasswordModal onClose={() => setIsPasswordModalOpen(false)} />}
    </ModalLayout>
  );
}
