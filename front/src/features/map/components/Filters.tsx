import { useState } from 'react';
import { createPortal } from 'react-dom';
import { EventFil, FiltersProps } from '../types/filters';
import styles from '../Map.module.css';
import CustomSelect from './CustomSelect';

const PRICE_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'free', label: 'Free' },
  { value: 'fee-based', label: 'Fee-based' },
];

export default function Filters({ onApplyFilters }: FiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const [city, setCity] = useState('Paris');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [priceType, setPriceType] = useState('');
  const [priceRange, setPriceRange] = useState([0, 500]);

  const handleOpen = () => {
    setIsAnimating(true);
    setIsOpen(true);
  };

  const handleClose = () => {
    // Keep isAnimating true so the close animation can play before unmounting
    setIsOpen(false);
  };

  const handleAnimationEnd = () => {
    if (!isOpen) {
      setIsAnimating(false);
    }
  };

  const handleApply = () => {
    if (onApplyFilters) {
      onApplyFilters({ city, startDate, endDate, priceType });
    }
  };

  const handleReset = () => {
    setCity('Paris');
    setStartDate('');
    setEndDate('');
    setPriceType('');
    if (onApplyFilters) {
      onApplyFilters({ city: 'Paris', startDate: '', endDate: '', priceType: '' });
    }
  };
  return (
    <>
      {/* Trigger Button: Kept fixed on the left border */}
      <button
        type="button"
        aria-label="Open Filters"
        onClick={handleOpen}
        className="glass-panel icon-btn fixed left-4 top-1/2 -translate-y-1/2 z-9999 w-10 h-10 rounded-full shadow-lg cursor-pointer active:scale-95 flex items-center justify-center"
        style={{ color: 'var(--color-blue-dark)' }}
      >
        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
          <path d="M12 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm0 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm0 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
        </svg>
      </button>

      {(isOpen || isAnimating) &&
        createPortal(
          <header
            data-state={isOpen ? 'open' : 'closed'}
            onAnimationEnd={handleAnimationEnd}
            className={`${styles.filterModal || styles.sidebarModal || 'filterModal'} glass-panel h-auto w-64 fixed left-3 top-1/2 flex flex-col p-4 gap-4 z-9999 rounded-xl shadow-2xl`}
            style={{ color: 'var(--color-blue-dark)' }}
          >
            <button
              type="button"
              aria-label="Close"
              className="glass-element icon-btn absolute top-2 right-2 z-10 w-8 h-8 p-1.5 rounded-xl duration-150 cursor-pointer active:scale-70 flex items-center justify-center"
              style={{ color: 'var(--color-blue-dark)' }}
              onClick={handleClose}
            >
              <svg
                className="w-full h-full"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>

            <h3
              className="text-lg font-bold text-center pb-2 pr-6"
              style={{ color: 'var(--color-blue-dark)', borderColor: 'var(--glass-border)' }}
            >
              Events Filters
            </h3>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold" style={{ color: 'var(--color-blue-dark)' }}>
                Ville / Localisation
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Ex: Paris"
                className="px-2 py-1 border border-white/20 rounded text-xs bg-white/90"
                style={{ color: 'var(--color-blue-dark)' }}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold" style={{ color: 'var(--color-blue-dark)' }}>
                Price category
              </label>
              <CustomSelect
                options={PRICE_OPTIONS}
                value={priceType}
				onChange={(val) => setPriceType(val)}
                placeholder="Select category"
              />
				{priceType === 'fee-based' && (
					<div>
						<label>Price range: {priceRange[0]}€ - {priceRange[1]}€</label>
						<input
						type="range"
						min={0}
						max={500}
						value={priceRange[0]}
						onChange={(e) => {const newMin = Math.min(Number(e.target.value), priceRange[1]);
						setPriceRange([newMin, priceRange[1]]);
						}}
						/>
						<input
						type="range"
						min={0}
						max={500}
						value={priceRange[1]}
						onChange={(e) => {const newMax = Math.max(Number(e.target.value), priceRange[0]);
						setPriceRange([priceRange[0], newMax]);
						}}
						/>
					</div>
				)}
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold" style={{ color: 'var(--color-blue-dark)' }}>
                From :
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-2 py-1 border border-white/20 rounded bg-white text-xs"
                style={{ color: 'var(--color-blue-dark)' }}
              />
            </div>

            <div className="flex gap-2 mt-2">
              <button
                type="button"
                onClick={handleApply}
                className="w-1/2 py-1.5 rounded text-xs font-semibold cursor-pointer"
                style={{ color: 'var(--color-blue-dark)' }}
              >
                Filtrer
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="w-1/2 py-1.5 rounded text-xs font-semibold cursor-pointer"
                style={{ color: 'var(--color-blue-dark)' }}
              >
                Reset
              </button>
            </div>
          </header>,
          document.body
        )}
    </>
  );
}
