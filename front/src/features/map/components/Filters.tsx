import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { FiltersProps } from '../../../types/map';
import styles from '../Map.module.css';
import CustomSelect from './CustomSelect';
import { CloseBtn } from '../../../types/icons';
import Button from '../../../components/ui/Button';

export default function Filters({ onApplyFilters }: FiltersProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const [city, setCity] = useState('Paris');
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
    setIsOpen(false);
  };

  const handleReset = () => {
    const defaultFilters = { city: 'Paris', startDate: '', endDate: '', priceType: '' };
    setCity('Paris');
    setStartDate('');
    setEndDate('');
    setPriceType('');
    onApplyFilters?.(defaultFilters);
    setIsOpen(false);
  };

  return (
    <>
      <Button variant="icon"
        type="button"
        aria-label="Open Filters"
        onClick={() => setIsOpen(true)}
        className={`glass-panel fixed left-4 top-1/2 -translate-y-1/2 z-500 w-10 h-10 rounded-full cursor-pointer active:scale-95 flex items-center justify-center ${styles.filterTrigger}`}
      >
        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
          <path d="M12 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm0 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm0 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
        </svg>
      </Button>

      {(isOpen || isAnimating) &&
        createPortal(
          <div
            onAnimationEnd={handleAnimationEnd}
            data-state={isOpen ? 'open' : 'closed'}
            className={`${styles.filterModal || styles.sidebarModal || 'filterModal'} glass-panel h-auto w-64 fixed left-3 top-1/2 -translate-y-1/2 flex flex-col p-4 gap-4 z-50 rounded-xl ${styles.filterPanel}`}
          >
            <Button variant="icon"
              type="button"
              aria-label="Close"
              className="modal-button modal-close"
              onClick={() => setIsOpen(false)}
            >
              <CloseBtn />
            </Button>

            <h3 className={`text-lg text-center pb-2 pr-6 ${styles.filterTitle}`}>
              {t('filters.title', 'Events Filters')}
            </h3>

            <div className="flex flex-col gap-1">
              <label className={`text-xs ${styles.filterLabel}`}>
                {t('filters.cityLabel', 'Ville / Localisation')}
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder={t('filters.cityPlaceholder', 'Ex: Paris')}
                className={styles.filterControl}
              />
            </div>

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
              <Button variant="primary"
                type="button"
                onClick={handleApply}
                className={`w-1/2 ${styles.filterAction} ${styles.filterActionPrimary}`}
              >
                {t('filters.apply', 'Filtrer')}
              </Button>
              <Button
                variant="secondary"
                type="button"
                onClick={handleReset}
                className={`flex items-center justify-center w-1/2 ${styles.filterAction} ${styles.filterActionSecondary}`}
              >
                {t('filters.reset', 'Reset')}
              </Button>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
