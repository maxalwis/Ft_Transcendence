import { PreferredCategory, PreferredLanguage, Prisma } from '../generated/prisma/client';

/* champs qu'un user peut renvoyer sans risque */
export const SAFE_USER_SELECT = {
  id: true,
  username: true,
  avatar: true,
  status: true,
  preferredLanguage: true,
  preferredCategory: true,
} satisfies Prisma.UserSelect;

export type SafeUser = Prisma.UserGetPayload<{ select: typeof SAFE_USER_SELECT }>;
