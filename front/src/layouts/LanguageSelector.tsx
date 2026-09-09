import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { FlagFR, FlagGB, FlagES, FlagSA } from './FlagIcons';

interface LanguageSelectorProps {
  sidebarOpen: boolean;
  sidebarWidth?: number;
  gap?: number;
}

export default function LanguageSelector({
  sidebarOpen,
  sidebarWidth = 360,
  gap = 40,
}: LanguageSelectorProps) {
  const { i18n } = useTranslation();
  const currentLang = i18n.language;

  const languages = [
    { code: 'fr', title: 'Français', Flag: FlagFR },
    { code: 'en', title: 'English', Flag: FlagGB },
    { code: 'es', title: 'Español', Flag: FlagES },
    { code: 'ar', title: 'العربية', Flag: FlagSA },
  ] as const;

  // Portail vers document.body : garantit un position:fixed relatif au
  // viewport même si un ancêtre (wrapper de page animé, motion.div, etc.)
  // a un transform/filter, ce qui casserait sinon le fixed classique.
  return createPortal(
    <div
      className="fixed top-4 z-1100 flex flex-col items-center gap-2 pointer-events-auto transition-[right] duration-300 ease-in-out"
    //   style={{ right: sidebarOpen ? sidebarWidth + 24 : 24 }}
	style={{ right: sidebarOpen ? sidebarWidth + gap : gap }}
    >
      {languages.map(({ code, title, Flag }) => (
        <button
          key={code}
          type="button"
          onClick={() => i18n.changeLanguage(code)}
          title={title}
          className={`glass-panel cursor-pointer px-3 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5 ${
            currentLang?.startsWith(code) ? 'isSelected' : ''
          }`}
        >
          <Flag className="w-5 h-5 rounded-sm object-cover shrink-0" />
        </button>
      ))}
    </div>,
    document.body,
  );
}
