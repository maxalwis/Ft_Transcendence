import { useTranslation } from 'react-i18next';

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

  return (
    <div className="relative w-full flex items-center justify-center z-50 pointer-events-none">
      {/* Boutons de traduction positionnés en haut à droite */}
      <div className="absolute right-0 top-0 flex items-center gap-2 pointer-events-auto">
        <button
          type="button"
          onClick={() => i18n.changeLanguage('fr')}
          title="Français"
          className="cursor-pointer text-lg bg-transparent border-none hover:scale-110 transition-transform"
        >
          🇫🇷
        </button>
        <button
          type="button"
          onClick={() => i18n.changeLanguage('en')}
          title="English"
          className="cursor-pointer text-lg bg-transparent border-none hover:scale-110 transition-transform"
        >
          🇬🇧
        </button>
        <button
          type="button"
          onClick={() => i18n.changeLanguage('es')}
          title="Español"
          className="cursor-pointer text-lg bg-transparent border-none hover:scale-110 transition-transform"
        >
          🇪🇸
        </button>
      </div>

      {/* Barre de navigation des catégories centrée */}
      <nav className="flex items-center gap-3 pointer-events-auto">
        {categories.map((cat) => {
          const isActive = (activeCategory || '') === cat.value;
          return (
            <button
              key={cat.value || 'all'}
              type="button"
              onClick={() => onSelectCategory?.(cat.value)}
              className={`glass-panel cursor-pointer hover:zoom-98 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
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