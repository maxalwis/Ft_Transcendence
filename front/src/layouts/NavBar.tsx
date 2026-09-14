import { useEffect, useRef, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

export type NavBarProps = {
  onSelectCategory?: (category: string) => void;
  activeCategory?: string;
  // Filtre prix : appliqué immédiatement à la sélection, pas de bouton "Filtrer".
  priceType?: string;
  onPriceChange?: (priceType: string) => void;
  // Filtre date : appliqué immédiatement à la sélection.
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
  const { t } = useTranslation();
  const [openPopover, setOpenPopover] = useState<'price' | 'date' | null>(null);
  const priceRef = useRef<HTMLDivElement>(null);
  const dateRef = useRef<HTMLDivElement>(null);

  // --- Scroll des catégories (flèches façon Google Maps) ---
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
        {/* Spacer gauche - garde la nav centrée sur desktop, ne bouge jamais */}
        <div className="w-45 hidden md:block" />

        {/* Category Navigation avec flèches de scroll sur small/medium */}
        <div className="relative z-10 flex items-center pointer-events-auto max-w-full py-4">
          {canScrollLeft && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  scrollCategories('left');
                }}
                aria-label={t('nav.scrollLeft', 'Défiler vers la gauche')}
                className="glass-panel icon-btn md:hidden flex-shrink-0 w-8 h-8 rounded-full mr-1"
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
              <div
                aria-hidden
                className="md:hidden pointer-events-none absolute left-9 top-0 bottom-0 w-6 bg-gradient-to-r from-black/10 to-transparent"
              />
            </>
          )}

          <nav
            ref={categoriesScrollRef}
            className="flex items-center gap-2 md:gap-3 overflow-x-auto max-w-full [&::-webkit-scrollbar]:hidden"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
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

          {canScrollRight && (
            <>
              <div
                aria-hidden
                className="md:hidden pointer-events-none absolute right-9 top-0 bottom-0 w-6 bg-gradient-to-l from-black/10 to-transparent"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  scrollCategories('right');
                }}
                aria-label={t('nav.scrollRight', 'Défiler vers la droite')}
                className="glass-panel icon-btn md:hidden flex-shrink-0 w-8 h-8 rounded-full ml-1"
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
            </>
          )}
        </div>

        {/* Spacer droit - même largeur que le spacer gauche, toujours présent.
            Le sélecteur de langue vit désormais dans <LanguageSelector />,
            positionné en fixed et rendu à côté de <NavBar />, donc il n'a
            plus aucun impact sur ce layout. */}
        <div className="w-45 hidden md:block" />
      </div>

      {/* Boutons Prix / Date - chacun ouvre son propre popover juste en dessous,
          qui applique le filtre dès la sélection (plus de bouton Filtrer/Réinitialiser). */}
      <nav className="relative z-10 flex items-center gap-2 pointer-events-auto py-1">
        <div className="relative" ref={priceRef}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setOpenPopover((prev) => (prev === 'price' ? null : 'price'));
            }}
            className={`glass-panel cursor-pointer px-4 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
              openPopover === 'price' ? 'isSelected' : ''
            }`}
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
            className={`glass-panel cursor-pointer px-4 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
              openPopover === 'date' ? 'isSelected' : ''
            }`}
          >
            {t('filters.dateButton', 'Date')}
          </button>

          {openPopover === 'date' && (
			<div className="glass-panel absolute top-full left-1/2 -translate-x-1/2 mt-2 min-h-10 min-w-35 flex items-center justify-center rounded-xl p-2 z-20">
			<input
				type="date"
				min="2026-08-01"
				max="2028-12-31"
				value={startDate || ''}
				onChange={(e) => {
				onDateChange?.(e.target.value);
				setOpenPopover(null);
				}}
				className="tracking px-3 py-1 rounded-xl bg-transparent outline-none"
			/>
			</div>
          )}
        </div>
      </nav>
    </div>
  );
}
