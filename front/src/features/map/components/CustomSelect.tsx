import { useState, useRef, useEffect } from 'react';

export interface SelectOption {
  value: string;
  label: string;
}

interface CustomSelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function CustomSelect({
  options,
  value,
  onChange,
  placeholder = 'Select option...',
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredValue, setHoveredValue] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          backgroundColor: '#ffffff',
          borderColor: 'var(--glass-border)',
          color: 'var(--color-blue-dark)',
        }}
        className="w-full flex items-center justify-between px-2.5 py-1.5 border rounded-md text-xs font-semibold focus:outline-none transition-colors cursor-pointer shadow-sm"
      >
        <span>{selectedOption ? selectedOption.label : placeholder}</span>
        <svg
          className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          style={{ color: 'var(--color-blue-dark)' }}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* White Dropdown Menu */}
      {isOpen && (
        <ul
          style={{
            backgroundColor: '#ffffff',
            borderColor: 'var(--glass-border)',
            boxShadow: 'var(--glass-shadow)',
          }}
          className="absolute top-full left-0 right-0 mt-1 z-50 border rounded-lg overflow-hidden py-1 max-h-48 overflow-y-auto"
        >
          {options.map((option) => {
            const isSelected = value === option.value;
            const isHovered = hoveredValue === option.value;

            return (
              <li
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                onMouseEnter={() => setHoveredValue(option.value)}
                onMouseLeave={() => setHoveredValue(null)}
                style={{
                  color:
                    isSelected || isHovered
                      ? 'var(--color-orange-primary)'
                      : 'var(--color-blue-dark)',
                  backgroundColor:
                    isSelected || isHovered ? 'var(--color-orange-hover)' : '#ffffff',
                }}
                className="px-3 py-1.5 text-xs font-medium cursor-pointer transition-colors"
              >
                {option.label}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
