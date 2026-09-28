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

  return (
    <EditProfileContent
      onClose={requestClose}
      shell={{
        portal: true,
        dataState: isClosing ? 'closed' : 'open',
        onAnimationEnd: handleAnimationEnd,
      }}
    />
  );
}
