import { createPortal } from 'react-dom';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LanguageIcon, FlagFR, FlagGB, FlagES, FlagSA } from './FlagIcons';

interface LanguageSelectorProps {
  embedded?: boolean;
}

export default function LanguageSelector({ embedded = false }: LanguageSelectorProps) {
  const { i18n } = useTranslation();

  const currentLang = i18n.language;

  const [isOpen, setIsOpen] = useState(false);

  const selectorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!embedded || !isOpen) {
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (selectorRef.current && !selectorRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [embedded, isOpen]);

  const languages = [
    { code: 'fr', title: 'Français', Flag: FlagFR },
    { code: 'en', title: 'English', Flag: FlagGB },
    { code: 'es', title: 'Español', Flag: FlagES },
    { code: 'ar', title: 'العربية', Flag: FlagSA },
  ] as const;

  const content = embedded ? (
    // Mobile
    <div ref={selectorRef} className="fixed top-4 right-4 z-1100 pointer-events-auto">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="glass-panel cursor-pointer p-2 rounded-full"
        title="Language"
        aria-label="Language"
        aria-expanded={isOpen}
      >
        <LanguageIcon className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 flex flex-col gap-2">
          {languages.map(({ code, title, Flag }) => (
            <button
              key={code}
              type="button"
              onClick={() => {
                i18n.changeLanguage(code);
                setIsOpen(false);
              }}
              title={title}
              className={`glass-panel cursor-pointer p-2 rounded-full ${
                currentLang?.startsWith(code) ? 'isSelected' : ''
              }`}
            >
              <Flag className="w-5 h-5 rounded-sm object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  ) : (
    // Desktop
    <div className="fixed top-1/2 -translate-y-1/2 right-4 z-1100 flex flex-col items-center gap-2 pointer-events-auto max-[900px]:top-[19%]">
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

  return createPortal(content, document.body);
}
