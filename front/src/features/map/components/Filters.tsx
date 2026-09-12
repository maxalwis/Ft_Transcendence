import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { FiltersProps } from '../../../types/map';
import styles from '../Map.module.css';
import CustomSelect from './CustomSelect';

type FiltersControlledProps = FiltersProps & {
  // Le panneau est désormais ouvert depuis les boutons Prix/Date de <NavBar />
  // (auparavant, un bouton svg local gérait son propre état isOpen).
  isOpen: boolean;
  onClose: () => void;
};

export default function Filters({ onApplyFilters, isOpen, onClose }: FiltersControlledProps) {
  const { t } = useTranslation();
  const [isAnimating, setIsAnimating] = useState(isOpen);

  useEffect(() => {
    if (isOpen) setIsAnimating(true);
  }, [isOpen]);

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [priceType, setPriceType] = useState('');

  // Define options inside with useMemo or outside to preserve references
  const PRICE_OPTIONS = [
    { value: '', label: t('filters.allPrices', 'All') },
    { value: 'free', label: t('filters.free', 'Free') },
    { value: 'fee-based', label: t('filters.feeBased', 'Fee-based') },
  ];

  const handleAnimationEnd = () => {
    if (!isOpen) {
      setIsAnimating(false);
    }
  };

  const handleApply = () => {
    onApplyFilters?.({
      startDate,
      endDate,
      priceType,
    });
    onClose();
  };

  const handleReset = () => {
    const defaultFilters = { city: 'Paris', startDate: '', endDate: '', priceType: '' };
    setStartDate('');
    setEndDate('');
    setPriceType('');
    onApplyFilters?.(defaultFilters);
    onClose();
  };

  return (
    <>
      {(isOpen || isAnimating) &&
        createPortal(
          <div
            onAnimationEnd={handleAnimationEnd}
            data-state={isOpen ? 'open' : 'closed'}
            className={`${styles.filterModal || styles.sidebarModal || 'filterModal'} glass-panel h-auto w-64 fixed left-3 top-1/2 -translate-y-1/2 flex flex-col p-4 gap-4 z-50 rounded-xl ${styles.filterPanel}`}
          >
            <button
              type="button"
              aria-label="Close"
              className="modal-close"
              onClick={onClose}
            >
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>

            <h3 className={`text-lg text-center pb-2 pr-6 ${styles.filterTitle}`}>
              {t('filters.title', 'Events Filters')}
            </h3>

            <div className="flex flex-col gap-1">
              <label className={`text-xs ${styles.filterLabel}`}>
                {t('filters.priceCategory', 'Price category')}
              </label>
              <CustomSelect
                options={PRICE_OPTIONS}
                value={priceType}
                onChange={(val) => setPriceType(val)}
                placeholder={t('filters.selectCategory', 'Select category')}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className={`text-xs ${styles.filterLabel}`}>
                {t('filters.fromDate', 'From :')}
              </label>
              <input
                type="date"
                min="2026-08-01"
                max="2028-12-31"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={`w-full ${styles.filterControl}`}
              />
            </div>

            <div dir="ltr" className="flex gap-2 mt-2">
              <button
                type="button"
                onClick={handleApply}
                className={`w-1/2 ${styles.filterAction} ${styles.filterActionPrimary}`}
              >
                {t('filters.apply', 'Filtrer')}
              </button>
              <button
                type="button"
                onClick={handleReset}
                className={`flex items-center justify-center w-1/2 ${styles.filterAction} ${styles.filterActionSecondary}`}
              >
                {t('filters.reset', 'Reset')}
              </button>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
