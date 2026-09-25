import { createPortal } from 'react-dom';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LanguageIcon, FlagFR, FlagGB, FlagES, FlagSA } from './FlagIcons';
import Button from '../components/ui/Button';

interface LanguageSelectorProps {
  embedded?: boolean;
  onWidthChange?: (width: number) => void;
}

export default function LanguageSelector({
  embedded = false,
  onWidthChange,
}: LanguageSelectorProps) {
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

  useEffect(() => {
    if (!embedded || !selectorRef.current || !onWidthChange) {
      return;
    }

    const element = selectorRef.current;

    const updateWidth = () => {
      onWidthChange(element.getBoundingClientRect().width);
    };

    updateWidth();

    const observer = new ResizeObserver(updateWidth);
    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [embedded, onWidthChange, isOpen]);

  const content = embedded ? (
    <div
      ref={selectorRef}
      className="
      fixed
      top-4
      right-4
      z-1100
      pointer-events-auto

      min-[901px]:flex
      min-[901px]:items-center
      min-[901px]:gap-2
      min-[901px]:flex-row-reverse
    "
    >
      {/* Language toggle */}
      <Button
        variant="icon"
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="glass-panel cursor-pointer p-2 rounded-[50%] max-[900px]:mb-1"
        title="Language"
        aria-label="Language"
        aria-expanded={isOpen}
      >
        <LanguageIcon className="w-5 h-5" />
      </Button>

      {isOpen && (
        <div
          className="
          flex
          flex-col
          gap-2

          min-[901px]:flex-row
        "
        >
          {languages.map(({ code, title, Flag }) => (
            <Button
              variant="icon"
              key={code}
              type="button"
              onClick={() => {
                i18n.changeLanguage(code);
                setIsOpen(false);
              }}
              title={title}
              className={`glass-panel cursor-pointer p-2 rounded-[50%] ${
                currentLang?.startsWith(code) ? 'isSelected' : ''
              }`}
            >
              <Flag className="w-5 h-5 rounded-sm object-cover" />
            </Button>
          ))}
        </div>
      )}
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
      flex-row
      items-center
      gap-2
      pointer-events-auto

      max-[900px]:top-[19%]
      max-[900px]:flex-col
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
