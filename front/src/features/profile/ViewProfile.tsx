import { useState } from 'react';
import { createPortal } from 'react-dom';
import type { User } from '../../api/friends';
import { useTranslation } from 'react-i18next';
import { resolveAvatarUrl } from './utils/avatar';
import './Modal.css';

interface ViewProfileProps {
  friend: User;
  onClose: () => void;
}

export default function ViewProfile({ friend, onClose }: ViewProfileProps) {
  const { t } = useTranslation();
  const [isClosing, setIsClosing] = useState(false);

  const requestClose = () => setIsClosing(true);

  const handleAnimationEnd = () => {
    if (isClosing) onClose();
  };

  return createPortal(
    <div className="modal-overlay profileModalOverlay" onClick={requestClose}>
      <div
        data-state={isClosing ? 'closed' : 'open'}
        onAnimationEnd={handleAnimationEnd}
        className="profileModal profileModalContent glass-panel"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="profileModalHeader">
          <h2>{t('publicProfile.title')}</h2>
          <button
            type="button"
            className="profileModalClose"
            onClick={requestClose}
            aria-label="Fermer"
          >
            x
          </button>
        </div>

        <div className="flex flex-col items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-slate-600 text-2xl font-semibold text-white">
            {friend.avatar ? (
              <img src={resolveAvatarUrl(friend.avatar) ?? undefined} alt="Avatar" className="h-full w-full object-cover" />
            ) : (
              friend.username.charAt(0).toUpperCase()
            )}
          </div>
          <h3 className="m-0! text-lg! text-white!">{friend.username}</h3>

          <div className="w-full space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-white/60">{t('publicProfile.preferredCategory')}</span>
              <span className="text-right text-white">
                {friend.preferredCategory ? t(`categories.${friend.preferredCategory.toLowerCase()}`) : t('publicProfile.notProvided')}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-white/60">{t('publicProfile.preferredLanguage')}</span>
              <span className="text-right text-white">
                {friend.preferredLanguage
                  ? { FR: 'Français', EN: 'English', ES: 'Español' }[friend.preferredLanguage]
                  : t('publicProfile.notProvided')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
