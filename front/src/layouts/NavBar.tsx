import { useTranslation } from 'react-i18next';

export type NavBarProps = {
  onSelectCategory?: (category: string) => void;
  activeCategory?: string;
  onOpenResults?: () => void;
};

export default function NavBar({
  onSelectCategory,
  activeCategory,
  onOpenResults,
}: NavBarProps) {
  const { t } = useTranslation();

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
      {/* Left spacer - keeps navigation centered */}
      <div className="w-45 hidden md:block" />

      {/* Category Navigation */}
      <nav className="relative z-10 flex items-center gap-2 md:gap-3 pointer-events-auto overflow-x-auto max-w-full py-4">
        {categories.map((cat) => {
          const currentCategory = (activeCategory || '').trim().toLowerCase();
          const targetCategory = cat.value.trim().toLowerCase();

          const isActive =
            targetCategory === ''
              ? currentCategory === ''
              : currentCategory === targetCategory;

          return (
            <button
              key={cat.value || 'all'}
              type="button"
              onClick={(e) => {
                e.stopPropagation();

                onSelectCategory?.(cat.value);
                onOpenResults?.();
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

      {/* Right spacer - keeps navigation centered */}
      <div className="w-45 hidden md:block" />
    </div>
  );
}