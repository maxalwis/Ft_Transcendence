import { useState } from 'react';
import { EventFil, FiltersProps } from '../types/filters';

export default function Filters({ onApplyFilters }: FiltersProps) {
  const [city, setCity] = useState('Paris');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [priceType, setPriceType] = useState('');

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
    <header className="glass-panel h-auto w-64 fixed left-1 top-1/2 -translate-y-1/2 flex flex-col p-4 gap-4 z-1000">
      <h3 className="text-lg font-bold text-center border-b border-white/20 pb-2">
        Events Filters
      </h3>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold">Ville / Localisation</label>
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Ex: Paris"
          className="px-2 py-1 border border-white/20 rounded text-xs"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold">Price category</label>
        <select
          value={priceType}
          onChange={(e) => setPriceType(e.target.value)}
          className="px-2 py-1 border border-white/20 rounded text-xs"
        >
          <option value="" className="bg-gray-800">
            All
          </option>
          <option value="free" className="bg-gray-800">
            Free
          </option>
          <option value="fee-based" className="bg-gray-800">
            Fee-based
          </option>
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold">From :</label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="w-full px-2 py-1 border border-white/20 rounded text-xs"
        />
      </div>

      <div className="flex gap-2 mt-2">
        <button
          type="button"
          onClick={handleApply}
          className="w-1/2 py-1.5 bg-green-600 hover:bg-green-500 rounded text-xs font-semibold cursor-pointer"
        >
          Filtrer
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="w-1/2 py-1.5 bg-red-600/60 hover:bg-red-500 rounded text-xs font-semibold cursor-pointer"
        >
          Reset
        </button>
      </div>
    </header>
  );
}
