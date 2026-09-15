import { useEffect, useRef, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import DatePicker, { registerLocale } from 'react-datepicker';
import { fr, enUS, es, ar } from 'date-fns/locale';
import 'react-datepicker/dist/react-datepicker.css';

registerLocale('fr', fr);
registerLocale('en', enUS);
registerLocale('es', es);
registerLocale('ar', ar);

export type NavBarProps = {
  onSelectCategory?: (category: string) => void;
  activeCategory?: string;
  priceType?: string;
  onPriceChange?: (priceType: string) => void;
  startDate?: string;
  onDateChange?: (date: string) => void;
};

export default function NavBar({
  onSelectCategory,
  activeCategory,
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

  //   Scroll for categories
  const categoriesScrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

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
    el.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' });
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

  // Updated to match the top database category groups
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

  return (
    <div
      dir="ltr"
      className="absolute top-0 left-0 right-0 z-500 flex flex-col items-center px-14 md:px-6 pointer-events-none"
    >
      <div className="w-full flex items-center justify-center md:justify-between">
        {/* Left spacer, keeps navbar in the middle */}
        <div className="w-45 hidden md:block" />

        {/* Category Navigation on small/medium */}
        <div className="relative z-10 flex items-center max-w-full py-4">
          {canScrollLeft && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                scrollCategories('left');
              }}
              aria-label={t('nav.scrollLeft', 'Défiler vers la gauche')}
              className="glass-icon-filter icon-btn md:hidden absolute left-0 z-20"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
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
                  <button
                    key={cat.value || 'all'}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectCategory?.(cat.value);
                    }}
                    className={`glass-filter ${isActive ? 'isSelected' : ''}`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {canScrollRight && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                scrollCategories('right');
              }}
              aria-label={t('nav.scrollRight', 'Défiler vers la droite')}
              className="glass-icon-filter icon-btn md:hidden absolute right-0 z-20"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          )}
        </div>

        {/* Right spacer */}
        <div className="w-45 hidden md:block" />
      </div>

      {/* Price and date button */}
      <nav className="relative z-10 flex items-center gap-2 pointer-events-auto py-1">
        <div className="relative" ref={priceRef}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setOpenPopover((prev) => (prev === 'price' ? null : 'price'));
            }}
            className={`glass-filter ${openPopover === 'price' || priceType ? 'isSelected' : ''}`}
          >
            {t('filters.priceButton', 'Prix')}
          </button>

          {openPopover === 'price' && (
            <div className="glass-panel absolute top-full left-1/2 -translate-x-1/2 mt-2 flex flex-col gap-1 min-w-[140px] rounded-xl p-1.5 z-20">
              {priceOptions.map((opt) => {
                const isActive = (priceType || '') === opt.value;
                return (
                  <button
                    key={opt.value || 'all-prices'}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onPriceChange?.(opt.value);
                      setOpenPopover(null);
                    }}
                    className={`text-left px-3 py-1.5 rounded-lg text-sm whitespace-nowrap ${
                      isActive ? 'isSelected' : ''
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="relative" ref={dateRef}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setOpenPopover((prev) => (prev === 'date' ? null : 'date'));
            }}
            className={`glass-filter ${openPopover === 'date' || startDate ? 'isSelected' : ''}`}
          >
            {t('filters.dateButton', 'Date')}
          </button>

          {openPopover === 'date' && (
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
                  }
                }}
                minDate={new Date('2026-08-01')}
                maxDate={new Date('2028-12-31')}
              />

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDateChange?.('');
                  setOpenPopover(null);
                }}
                className="w-full mt-1 px-3 py-1.5 rounded-lg text-sm transition-all"
              >
                {t('filters.resetDate', 'Réinitialiser')}
              </button>
            </div>
          )}
        </div>
      </nav>
    </div>
  );
}
