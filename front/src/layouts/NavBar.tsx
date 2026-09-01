import { useTranslation } from 'react-i18next';
import { FlagFR, FlagGB, FlagES } from './FlagIcons';

export type NavBarProps = {
  onSelectCategory?: (category: string) => void;
  activeCategory?: string;
};

export default function NavBar({ onSelectCategory, activeCategory }: NavBarProps) {
  const { t, i18n } = useTranslation();

  const categories = [
    { label: t('nav.all'), value: '' },
    { label: t('nav.culture'), value: 'Culture' },
    { label: t('nav.sports'), value: 'Sport' },
    { label: t('nav.music'), value: 'Concert' },
    { label: t('nav.family'), value: 'Enfants' },
  ];

  const currentLang = i18n.language;

  return (
    <div className="relative w-full flex items-center justify-center z-50 pointer-events-none">
      {/* Flag Language Selector */}
      <div className="absolute right-0 top-0 flex items-center gap-2 pointer-events-auto">
        <button
          type="button"
          onClick={() => i18n.changeLanguage('fr')}
          title="Français"
          className={`glass-panel cursor-pointer px-3 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5 ${
            currentLang === 'fr' ? 'bg-blue-600 text-white shadow-md' : 'bg-white/70 backdrop-blur-md'
          }`}
        >
          <FlagFR className="w-5 h-5 rounded-sm object-cover shrink-0" />
        </button>

        <button
          type="button"
          onClick={() => i18n.changeLanguage('en')}
          title="English"
          className={`glass-panel cursor-pointer px-3 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5 ${
            currentLang === 'en' ? 'bg-blue-600 text-white shadow-md' : 'bg-white/70 backdrop-blur-md'
          }`}
        >
          <FlagGB className="w-5 h-5 rounded-sm object-cover shrink-0" />
        </button>

        <button
          type="button"
          onClick={() => i18n.changeLanguage('es')}
          title="Español"
          className={`glass-panel cursor-pointer px-3 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5 ${
            currentLang === 'es' ? 'bg-blue-600 text-white shadow-md' : 'bg-white/70 backdrop-blur-md'
          }`}
        >
          <FlagES className="w-5 h-5 rounded-sm object-cover shrink-0" />
        </button>
      </div>

      {/* Category Navigation */}
      <nav className="flex items-center gap-3 pointer-events-auto">
        {categories.map((cat) => {
          const isActive = (activeCategory || '') === cat.value;
          return (
            <button
              key={cat.value || 'all'}
              type="button"
              onClick={() => onSelectCategory?.(cat.value)}
              className={`glass-panel cursor-pointer px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                isActive ? 'bg-blue-600 text-white shadow-md' : 'bg-white/70 backdrop-blur-md'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}