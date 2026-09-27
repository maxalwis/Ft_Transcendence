import { useState } from 'react';
import { resolveAvatarUrl } from '../../features/profile/utils/avatar';

interface AvatarProps {
  avatar?: string | null;
  username?: string | null;
  alt?: string;
  className?: string;
  referrerPolicy?: React.HTMLAttributeReferrerPolicy;
}

// Affiche l'avatar (ou l'image par défaut) et se rabat sur l'initiale du username
// uniquement si même l'image par défaut échoue à charger.
export default function Avatar({ avatar, username, alt = 'Avatar', className, referrerPolicy }: AvatarProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return <span className={className}>{username?.charAt(0).toUpperCase() || '?'}</span>;
  }

  return (
    <img
      src={resolveAvatarUrl(avatar)}
      alt={alt}
      referrerPolicy={referrerPolicy}
      className={className}
      onError={() => setFailed(true)}
    />
  );
}
