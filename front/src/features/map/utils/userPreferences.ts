import type { User } from '../../../context/auth/AuthContextInstance';

const LANGUAGE_MAP: Record<NonNullable<User['preferredLanguage']>, string> = {
  FR: 'fr',
  EN: 'en',
  ES: 'es',
  AR: 'ar',
};

const CATEGORY_MAP: Record<NonNullable<User['preferredCategory']>, string> = {
  MUSIC: 'musique',
  CULTURE: 'culture',
  WORKSHOPS: 'ateliers',
  LEISURE: 'loisirs',
  OTHERS: 'autres',
};

export function mapPreferredLanguage(preferredLanguage: User['preferredLanguage']): string | null {
  if (!preferredLanguage) return null;
  return LANGUAGE_MAP[preferredLanguage] ?? null;
}

export function mapPreferredCategory(preferredCategory: User['preferredCategory']): string | null {
  if (!preferredCategory) return null;
  return CATEGORY_MAP[preferredCategory] ?? null;
}
