// Valeurs envoyées par les boutons de filtre du frontend (front/src/layouts/NavBar.tsx)
export type CategoryButton = 'musique' | 'culture' | 'ateliers' | 'loisirs' | 'autres';

/* bouton UI -> mots-clés à chercher dans Event.category */
export const CATEGORY_KEYWORDS: Record<Exclude<CategoryButton, 'autres'>, string[]> = {
  musique: ['concert', 'musique', 'festival', 'spectacle musical'],
  culture: [
    'théâtre',
    'theatre',
    'expo',
    'danse',
    'art',
    'histoire',
    'littérature',
    'cinéma',
    'cinema',
  ],
  ateliers: ['atelier', 'conférence', 'conference', 'rencontre'],
  loisirs: ['loisirs', 'sport', 'balade', 'nature', 'santé', 'sante', 'enfants'],
};
