const backendOrigin = `https://localhost:${import.meta.env.VITE_HTTPS_PORT}`;

export const DEFAULT_AVATAR_URL = '/profile_picture_default.webp';

export const resolveAvatarUrl = (avatar: string | null | undefined): string => {
  if (!avatar) return DEFAULT_AVATAR_URL;
  if (avatar.startsWith('http://') || avatar.startsWith('https://')) {
    return avatar;
  }
  // uniquement les fichiers uploadés (/uploads/avatars/...) sont servis par le backend
  if (avatar.startsWith('/uploads/')) {
    return `${backendOrigin}${avatar}`;
  }
  return avatar;
};
