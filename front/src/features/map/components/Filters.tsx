import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { EventFilters } from '../../../types/event';
import CustomSelect from './CustomSelect';

export type FiltersProps = {
  onApplyFilters?: (filters: EventFilters) => void;
};

export default function Filters({ onApplyFilters }: FiltersProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const [city, setCity] = useState('Paris');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [priceType, setPriceType] = useState('');

  const PRICE_OPTIONS = [
    { value: '', label: t('filters.allPrices', 'All') },
    { value: 'free', label: t('filters.free', 'Free') },
    { value: 'fee-based', label: t('filters.feeBased', 'Fee-based') },
  ];

  const handleApply = () => {
    if (onApplyFilters) {
      onApplyFilters({ 
        city, 
        startDate, 
        endDate, 
        priceType,
      } as any);
    }
    setIsOpen(false);
  };

  const handleReset = () => {
    setCity('Paris');
    setStartDate('');
    setEndDate('');
    setPriceType('');
    if (onApplyFilters) {
      onApplyFilters({ 
        city: 'Paris', 
        startDate: '', 
        endDate: '', 
        priceType: '',
      } as any);
    }
    setIsOpen(false);
  };

  return (
    <>
      <button
        type="button"
        aria-label="Open Filters"
        onClick={() => setIsOpen(true)}
        className="glass-panel icon-btn fixed left-4 top-1/2 -translate-y-1/2 z-[9999] w-10 h-10 rounded-full shadow-lg cursor-pointer active:scale-95 flex items-center justify-center"
        style={{ color: 'var(--color-blue-dark)' }}
      >
        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
          <path d="M12 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm0 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm0 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
        </svg>
      </button>

      {isOpen &&
        createPortal(
          <header
            className="filterModal glass-panel h-auto w-64 fixed left-3 top-1/2 -translate-y-1/2 flex flex-col p-4 gap-4 z-[9999] rounded-xl shadow-2xl"
            style={{ color: 'var(--color-blue-dark)' }}
          >
            <button
              type="button"
              aria-label="Close"
              className="glass-element icon-btn absolute top-2 right-2 z-10 w-8 h-8 p-1.5 rounded-xl duration-150 cursor-pointer active:scale-70 flex items-center justify-center"
              style={{ color: 'var(--color-blue-dark)' }}
              onClick={() => setIsOpen(false)}
            >
              <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>

            <h3 className="text-lg font-bold text-center pb-2 pr-6" style={{ color: 'var(--color-blue-dark)' }}>
              {t('filters.title', 'Events Filters')}
            </h3>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold">{t('filters.cityLabel', 'Ville / Localisation')}</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder={t('filters.cityPlaceholder', 'Ex: Paris')}
                className="px-2 py-1 border border-white/20 rounded text-xs bg-white/90"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold">{t('filters.priceCategory', 'Price category')}</label>
              <CustomSelect
                options={PRICE_OPTIONS}
                value={priceType}
                onChange={(val) => setPriceType(val)}
                placeholder={t('filters.selectCategory', 'Select category')}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold">{t('filters.fromDate', 'From :')}</label>
              <input
                type="date"
                min="2026-08-01"
                max="2028-12-31"
                value={startDate}
                onChange={(e) => {
                  const newDate = e.target.value;
                  setStartDate(newDate);
                  if (onApplyFilters) {
                    onApplyFilters({ 
                      city, 
                      startDate: newDate, 
                      endDate, 
                      priceType,
                    } as any);
                  }
                }}
                className="w-full px-2 py-1 border border-white/20 rounded bg-white text-xs"
              />
            </div>

            <div className="flex gap-2 mt-2">
              <button
                type="button"
                onClick={handleApply}
                className="w-1/2 py-1.5 rounded text-xs font-semibold cursor-pointer bg-blue-600 text-white"
              >
                {t('filters.apply', 'Filtrer')}
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="w-1/2 py-1.5 rounded text-xs font-semibold cursor-pointer bg-gray-200"
              >
                {t('filters.reset', 'Reset')}
              </button>
            </div>
          </header>,
          document.body
        )}
    </>
  );
}