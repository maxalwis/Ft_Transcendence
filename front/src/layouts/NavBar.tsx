import { useTranslation } from 'react-i18next';
import { FlagFR, FlagGB, FlagES, FlagSA } from './FlagIcons';

export type NavBarProps = {
  onSelectCategory?: (category: string) => void;
  activeCategory?: string;
  showLanguageSelector?: boolean;
};

export default function NavBar({
  onSelectCategory,
  activeCategory,
  showLanguageSelector = true,
}: NavBarProps) {
  const { t, i18n } = useTranslation();

  // Updated to match the top database category groups
  const categories = [
    { label: t('categories.all', 'Tout'), value: '' },
    { label: t('categories.music', 'Musique'), value: 'musique' },
    { label: t('categories.culture', 'Culture'), value: 'culture' },
    { label: t('categories.workshops', 'Ateliers'), value: 'ateliers' },
    { label: t('categories.leisure', 'Loisirs & Sport'), value: 'loisirs' },
    { label: t('categories.others', 'Autres'), value: 'autres' },
  ];

  const currentLang = i18n.language;

  return (
    <div
      dir="ltr"
      className="absolute top-0 left-0 right-0 z-[1000] flex items-center justify-between px-6 pointer-events-none"
    >
      {/* Spacer to keep nav perfectly centered */}
      <div className="w-[120px] hidden md:block" />

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

      {showLanguageSelector ? (
        <div className="relative z-10 flex items-center gap-2 pointer-events-auto shrink-0">
          <button
            type="button"
            onClick={() => i18n.changeLanguage('fr')}
            title="Français"
            className={`glass-panel cursor-pointer px-3 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5 ${
              currentLang?.startsWith('fr') ? 'isSelected' : ''
            }`}
          >
            <FlagFR className="w-5 h-5 rounded-sm object-cover shrink-0" />
          </button>

          <button
            type="button"
            onClick={() => i18n.changeLanguage('en')}
            title="English"
            className={`glass-panel cursor-pointer px-3 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5 ${
              currentLang?.startsWith('en') ? 'isSelected' : ''
            }`}
          >
            <FlagGB className="w-5 h-5 rounded-sm object-cover shrink-0" />
          </button>

          <button
            type="button"
            onClick={() => i18n.changeLanguage('es')}
            title="Español"
            className={`glass-panel cursor-pointer px-3 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5 ${
              currentLang?.startsWith('es') ? 'isSelected' : ''
            }`}
          >
            <FlagES className="w-5 h-5 rounded-sm object-cover shrink-0" />
          </button>

          <button
            type="button"
            onClick={() => i18n.changeLanguage('ar')}
            title="العربية"
            className={`glass-panel cursor-pointer px-3 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5 ${
              currentLang?.startsWith('ar') ? 'isSelected' : ''
            }`}
          >
            <FlagSA className="w-5 h-5 rounded-sm object-cover shrink-0" />
          </button>
        </div>
      ) : (
        <div className="hidden w-[120px] md:block" />
      )}
    </div>
  );
}
