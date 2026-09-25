import { useEffect, useRef, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import DatePicker, { registerLocale } from 'react-datepicker';
import { fr, enUS, es, ar } from 'date-fns/locale';
import LanguageSelector from './LanguageSelector';
import 'react-datepicker/dist/react-datepicker.css';
import Button from '../components/ui/Button';
import { ArrowLeftIcon, ArrowRightIcon } from '../types/icons';

registerLocale('fr', fr);
registerLocale('en', enUS);
registerLocale('es', es);
registerLocale('ar', ar);

export type NavBarProps = {
  onSelectCategory?: (category: string) => void;
  activeCategory?: string;
  onOpenResults?: () => void;
  priceType?: string;
  onPriceChange?: (priceType: string) => void;
  startDate?: string;
  onDateChange?: (date: string) => void;
};

export default function NavBar({
  onSelectCategory,
  activeCategory,
  onOpenResults,
  priceType,
  onPriceChange,
  startDate,
  onDateChange,
}: NavBarProps) {
  const { t, i18n } = useTranslation();
  const datePickerLocale = i18n.language.split('-')[0];
  const [openPopover, setOpenPopover] = useState<'price' | 'date' | null>(null);
  const priceRef = useRef<HTMLDivElement>(null);
  const dateRef = useRef<HTMLDivElement>(null);

  // Scroll for categories
  const categoriesScrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [languageSelectorWidth, setLanguageSelectorWidth] = useState(0);

  const updateScrollState = useCallback(() => {
    const el = categoriesScrollRef.current;
    if (!el) return;

    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 4);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 4);
  }, []);

  useEffect(() => {
    updateScrollState();

    const el = categoriesScrollRef.current;
    if (!el) return;

    const handleScroll = () => updateScrollState();
    el.addEventListener('scroll', handleScroll, { passive: true });

    const resizeObserver = new ResizeObserver(() => updateScrollState());
    resizeObserver.observe(el);

    window.addEventListener('resize', updateScrollState);

    return () => {
      el.removeEventListener('scroll', handleScroll);
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateScrollState);
    };
  }, [updateScrollState]);

  const scrollCategories = (direction: 'left' | 'right') => {
    const el = categoriesScrollRef.current;
    if (!el) return;

    const amount = el.clientWidth * 0.6;

    el.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: 'smooth',
    });
  };

  // Ferme le popover ouvert si on clique en dehors (bouton + panneau)
  useEffect(() => {
    if (!openPopover) return;

    const handleClickOutside = (e: MouseEvent) => {
      const ref = openPopover === 'price' ? priceRef : dateRef;

      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpenPopover(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openPopover]);

  const categories = [
    { label: t('categories.all', 'Tout'), value: '' },
    { label: t('categories.music', 'Musique'), value: 'musique' },
    { label: t('categories.culture', 'Culture'), value: 'culture' },
    { label: t('categories.workshops', 'Ateliers'), value: 'ateliers' },
    { label: t('categories.leisure', 'Loisirs & Sport'), value: 'loisirs' },
    { label: t('categories.others', 'Autres'), value: 'autres' },
  ];

  const priceOptions = [
    { label: t('filters.allPrices', 'Tous'), value: '' },
    { label: t('filters.free', 'Gratuit'), value: 'free' },
    { label: t('filters.feeBased', 'Payant'), value: 'fee-based' },
  ];

  const filters = [
    {
      type: 'price' as const,
      label: t('filters.priceButton', 'Prix'),
      value: priceType || '',
      options: priceOptions,
    },
    {
      type: 'date' as const,
      label: t('filters.dateButton', 'Date'),
      value: startDate || '',
    },
  ];

  return (
    <div
      dir="ltr"
      className="absolute top-0 left-0 right-0 z-500 flex flex-col items-center px-14 md:px-6 pointer-events-none"
    >
      <LanguageSelector embedded onWidthChange={setLanguageSelectorWidth} />

      <div
        className="w-full grid items-center py-4"
        style={{
          gridTemplateColumns: `45px minmax(0, 1fr) ${Math.max(languageSelectorWidth, 45)}px`,
        }}
      >
        {/* Left spacer */}
        <div />

        {/* Category Navigation */}
        <div className="relative z-10 flex items-center justify-center min-w-0">
          {canScrollLeft && (
            <Button variant="icon"
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                scrollCategories('left');
              }}
              aria-label={t('nav.scrollLeft', 'Défiler vers la gauche')}
              className="glass-icon-filter  md:hidden absolute left-0 z-20"
            >
              <ArrowLeftIcon className="h-4 w-4"/>
            </Button>
          )}

          {/* Actual clipping area */}
          <div className="max-w-full overflow-hidden px-4">
            <nav
              ref={categoriesScrollRef}
              className="flex items-center gap-2 md:gap-3 overflow-x-auto [&::-webkit-scrollbar]:hidden"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {categories.map((cat) => {
                const currentCategory = (activeCategory || '').trim().toLowerCase();
                const targetCategory = cat.value.trim().toLowerCase();

                const isActive =
                  targetCategory === ''
                    ? currentCategory === ''
                    : currentCategory === targetCategory;

                return (
                  <Button variant="ghost"
                    key={cat.value || 'all'}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectCategory?.(cat.value);
                      onOpenResults?.();
                    }}
                    className={`glass-filter ${isActive ? 'isSelected' : ''}`}
                  >
                    {cat.label}
                  </Button>
                );
              })}
            </nav>
          </div>

          {canScrollRight && (
            <Button variant="icon"
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                scrollCategories('right');
              }}
              aria-label={t('nav.scrollRight', 'Défiler vers la droite')}
              className="glass-icon-filter md:hidden absolute right-0 z-20"
            >
              <ArrowRightIcon className="h-4 w-4"/>
            </Button>
          )}
        </div>

        {/* Right spacer */}
        <div className="w-45 hidden md:block shrink-0" />
      </div>

      {/* Price and date button */}
      <nav className="relative z-10 flex items-center gap-2 pointer-events-auto py-1">
        {filters.map((filter) => {
          const isOpen = openPopover === filter.type;

          const isSelected = filter.type === 'price' ? !!priceType : !!startDate;

          return (
            <div key={filter.type} className="relative">
              <Button variant="ghost"
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenPopover((prev) => (prev === filter.type ? null : filter.type));
                }}
                className={`glass-filter ${isOpen || isSelected ? 'isSelected' : ''}`}
              >
                {filter.label}
              </Button>

              {isOpen && (
                <>
                  {filter.type === 'price' && (
                    <div className="glass-panel absolute top-full left-1/2 -translate-x-1/2 mt-2 flex flex-col gap-1 min-w-[140px] rounded-xl p-1.5 z-20">
                      {priceOptions.map((opt) => {
                        const isActive = (priceType || '') === opt.value;

                        return (
                          <Button variant="ghost"
                            key={opt.value || 'all-prices'}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onPriceChange?.(opt.value);
                              setOpenPopover(null);
                              onOpenResults?.();
                            }}
                            className={`text-left px-3 py-1.5 rounded-lg text-sm whitespace-nowrap ${
                              isActive ? 'isSelected' : ''
                            }`}
                          >
                            {opt.label}
                          </Button>
                        );
                      })}
                    </div>
                  )}

                  {filter.type === 'date' && (
                    <div className="glass-panel absolute top-full left-1/2 -translate-x-1/2 mt-2 rounded-xl p-2 z-20">
                      <DatePicker
                        inline
                        locale={datePickerLocale}
                        selected={startDate ? new Date(startDate) : null}
                        onChange={(date: Date | null) => {
                          if (date) {
                            const formatted = date.toLocaleDateString('en-CA');
                            onDateChange?.(formatted);
                            setOpenPopover(null);
                            onOpenResults?.();
                          }
                        }}
                        minDate={new Date('2026-08-01')}
                        maxDate={new Date('2028-12-31')}
                      />

                      <Button
                        variant="ghost"
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDateChange?.('');
                          setOpenPopover(null);
                          onOpenResults?.();
                        }}
                        className="w-full !mt-1 !px-3 !py-1.5 rounded-lg text-sm"
                      >
                        {t('filters.resetDate', 'Réinitialiser')}
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </nav>
    </div>
  );
}
