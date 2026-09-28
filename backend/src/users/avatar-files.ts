import { Logger } from '@nestjs/common';
import { unlink } from 'fs/promises';
import { basename, join } from 'path';

const logger = new Logger('AvatarFiles');

// Même dossier que la destination multer de PUT /users/me (relatif au cwd du process)
const AVATAR_URL_PREFIX = '/uploads/avatars/';
const AVATAR_DIR = join(process.cwd(), 'uploads', 'avatars');

/**
 * Supprime du disque un avatar uploadé par l'utilisateur (RGPD : effacement complet,
 * et pas de fichier orphelin quand l'avatar est remplacé). Les avatars par défaut ou
 * fournis par OAuth (URL externe) ne sont pas concernés. Best effort : une erreur
 * est seulement loggée, elle ne doit pas faire échouer la suppression du compte.
 */
export async function removeUploadedAvatar(avatarUrl?: string | null): Promise<void> {
  if (!avatarUrl?.startsWith(AVATAR_URL_PREFIX)) return;

  // basename() : jamais de chemin hors du dossier des avatars (../)
  const file = join(AVATAR_DIR, basename(avatarUrl));

  try {
    await unlink(file);
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== 'ENOENT') {
      logger.warn(`Could not delete avatar file ${file}: ${String(err)}`);
    }
  }
}
