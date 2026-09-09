import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { FlagFR, FlagGB, FlagES, FlagSA } from './FlagIcons';

interface LanguageSelectorProps {
  embedded?: boolean;
}

export default function LanguageSelector({ embedded = false }: LanguageSelectorProps) {
  const { i18n } = useTranslation();
  const currentLang = i18n.language;

  const languages = [
    { code: 'fr', title: 'Français', Flag: FlagFR },
    { code: 'en', title: 'English', Flag: FlagGB },
    { code: 'es', title: 'Español', Flag: FlagES },
    { code: 'ar', title: 'العربية', Flag: FlagSA },
  ] as const;

  const content = (
    <div
      className={
        embedded
          ? 'absolute top-0 right-full mr-4 z-1100 flex flex-col items-center gap-2 pointer-events-auto'
          : 'fixed top-4 right-10 z-1100 flex flex-col items-center gap-2 pointer-events-auto'
      }
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
    </div>
  );

  // If selector is in sidebar, no portal
  if (embedded) {
    return content;
  }

  // Else, we create on body
  return createPortal(content, document.body);
}
