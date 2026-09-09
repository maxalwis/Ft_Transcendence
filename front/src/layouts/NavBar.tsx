import { useTranslation } from 'react-i18next';

export type NavBarProps = {
  onSelectCategory?: (category: string) => void;
  activeCategory?: string;
};

export default function NavBar({ onSelectCategory, activeCategory }: NavBarProps) {
  const { t } = useTranslation();

  // Updated to match the top database category groups
  const categories = [
    { label: t('categories.all', 'Tout'), value: '' },
    { label: t('categories.music', 'Musique'), value: 'musique' },
    { label: t('categories.culture', 'Culture'), value: 'culture' },
    { label: t('categories.workshops', 'Ateliers'), value: 'ateliers' },
    { label: t('categories.leisure', 'Loisirs & Sport'), value: 'loisirs' },
    { label: t('categories.others', 'Autres'), value: 'autres' },
  ];

  return (
    <div
      dir="ltr"
      className="absolute top-0 left-0 right-0 z-500 flex items-center justify-between px-6 pointer-events-none"
    >
      {/* Spacer gauche - garde la nav centrée, ne bouge jamais */}
      <div className="w-45 hidden md:block" />

      {/* Category Navigation - Forced relative & pointer-events-auto */}
      <nav className="relative z-10 flex items-center gap-2 md:gap-3 pointer-events-auto overflow-x-auto max-w-full py-4">
        {categories.map((cat) => {
          const currentCategory = (activeCategory || '').trim().toLowerCase();
          const targetCategory = cat.value.trim().toLowerCase();

          // "All" is active if target is empty AND current active category is empty
          // Specific category is active if strings match case-insensitively
          const isActive =
            targetCategory === '' ? currentCategory === '' : currentCategory === targetCategory;

          return (
            <button
              key={cat.value || 'all'}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelectCategory?.(cat.value);
              }}
              className={`glass-panel cursor-pointer px-4 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                isActive ? 'isSelected' : ''
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </nav>

      {/* Spacer droit - même largeur que le spacer gauche, toujours présent.
          Le sélecteur de langue vit désormais dans <LanguageSelector />,
          positionné en fixed et rendu à côté de <NavBar />, donc il n'a
          plus aucun impact sur ce layout. */}
      <div className="w-45 hidden md:block" />
    </div>
  );
}
