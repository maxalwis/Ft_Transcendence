import { useState } from 'react';

interface PasswordModalProps {
  onClose: () => void;
}

export default function PasswordModal({ onClose }: PasswordModalProps) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const requestClose = () => setIsClosing(true);

  const handleAnimationEnd = () => {
    if (isClosing) onClose();
  };

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setPasswordError(null);

    if (newPassword !== confirmPassword) {
      setPasswordError('Les mots de passe ne correspondent pas.');
      return;
    }

    setIsChangingPassword(true);

    try {
      requestClose();
      setNewPassword('');
      setConfirmPassword('');
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="modal-overlay profileModalOverlay passwordModalOverlay" onClick={requestClose}>
      <div
        data-state={isClosing ? 'closed' : 'open'}
        onAnimationEnd={handleAnimationEnd}
        className="profileModal profileModalContent glass-panel"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="profileModalHeader">
          <h2>Changer le mot de passe</h2>
          <button
            type="button"
            className="profileModalClose"
            onClick={requestClose}
            aria-label="Fermer"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="password-form">
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
            <button type="button" className="btn-secondary" onClick={requestClose}>
              Annuler
            </button>
            <button type="submit" className="btn-primary" disabled={isChangingPassword}>
              {isChangingPassword ? 'Chargement...' : 'Changer le mot de passe'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
