import { createPortal } from 'react-dom';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LanguageIcon, FlagFR, FlagGB, FlagES, FlagSA } from './FlagIcons';
import Button from '../components/ui/Button';

interface LanguageSelectorProps {
  embedded?: boolean;
}

export default function LanguageSelector({ embedded = false }: LanguageSelectorProps) {
  const languages = [
    { code: 'fr', title: 'Français', Flag: FlagFR },
    { code: 'en', title: 'English', Flag: FlagGB },
    { code: 'es', title: 'Español', Flag: FlagES },
    { code: 'ar', title: 'العربية', Flag: FlagSA },
  ] as const;
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

  const content = embedded ? (
    <div
      ref={selectorRef}
      className="
        fixed
        top-[calc(var(--nav-row2-top)+0.25rem)]
        right-4
        z-1100
        pointer-events-auto

        min-[901px]:top-4
        flex
        items-center
        gap-2
        flex-col
      "
    >
      {/* Language toggle */}
      <Button
        variant="flag"
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="glass-panel mb-1"
        title="Language"
        aria-label="Language"
        aria-expanded={isOpen}
      >
        <LanguageIcon className="w-5 h-5" />
      </Button>

      <div
        inert={!isOpen}
        aria-hidden={!isOpen}
        className={`
          grid
          transition-[grid-template-rows,opacity,transform]
          duration-300
          ease-out
          motion-reduce:transition-none
          ${isOpen ? 'grid-rows-[1fr] opacity-100 translate-y-0' : 'grid-rows-[0fr] opacity-0 -translate-y-2'}
        `}
      >
        <div className="flex gap-2 flex-col overflow-hidden min-h-0">
          {languages.map(({ code, title, Flag }) => (
            <Button
              variant="flag"
              key={code}
              type="button"
              onClick={() => {
                i18n.changeLanguage(code);
                setIsOpen(false);
              }}
              title={title}
              className={`glass-panel ${currentLang?.startsWith(code) ? 'isSelected' : ''}`}
            >
              <Flag className="w-5 h-5 rounded-sm object-cover" />
            </Button>
          ))}
        </div>
      </div>
    </div>
  ) : (
    // Desktop / non-embedded
    <div
      className="
      fixed
      top-1/2
      -translate-y-1/2
      right-4
      z-1100
      flex
      items-center
      gap-2
      pointer-events-auto

      max-[900px]:top-[19%]
      flex-col
    "
    >
      {languages.map(({ code, title, Flag }) => (
        <Button
          key={code}
          variant="icon"
          type="button"
          onClick={() => i18n.changeLanguage(code)}
          title={title}
          className={`glass-panel cursor-pointer px-3 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5 ${
            currentLang?.startsWith(code) ? 'isSelected' : ''
          }`}
        >
          <Flag className="w-5 h-5 rounded-sm object-cover shrink-0" />
        </Button>
      ))}
    </div>
  );

  return createPortal(content, document.body);
}
