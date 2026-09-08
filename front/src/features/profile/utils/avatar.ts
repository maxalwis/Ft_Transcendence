const backendOrigin = `https://localhost:${import.meta.env.VITE_HTTPS_PORT}`;

export const resolveAvatarUrl = (avatar: string | null | undefined): string | null => {
  if (!avatar) return null;
  if (avatar.startsWith('http://') || avatar.startsWith('https://')) {
    return avatar;
  }
  return `${backendOrigin}${avatar}`;
};
