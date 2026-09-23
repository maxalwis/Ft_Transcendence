import { createPortal } from 'react-dom';
import { useState } from 'react';
import EditProfileContent from './EditProfileContent';

interface EditProfileProps {
  onClose: () => void;
}

export default function EditProfile({ onClose }: EditProfileProps) {
  const [isClosing, setIsClosing] = useState(false);

  const requestClose = () => setIsClosing(true);

  const handleAnimationEnd = () => {
    if (isClosing) {
      onClose();
    }
  };

  return createPortal(
    <div className="glass-modal-overlay" onClick={requestClose}>
      <div
        data-state={isClosing ? 'closed' : 'open'}
        onAnimationEnd={handleAnimationEnd}
        className="glass-modal modalContent"
        onClick={(e) => e.stopPropagation()}
      >
        <EditProfileContent onClose={requestClose} />
      </div>
    </div>,
    document.body
  );
}
