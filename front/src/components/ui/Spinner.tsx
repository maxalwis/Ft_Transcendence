interface SpinnerProps {
  // Visible caption under the spinner, also announced to screen readers
  label?: string;
  size?: 'sm' | 'md';
  className?: string;
}

export default function Spinner({ label, size = 'md', className = '' }: SpinnerProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`ds-spinner ${size === 'sm' ? 'ds-spinner-sm' : ''} ${className}`}
    >
      <span className="ds-spinner-circle" aria-hidden="true" />
      {label && <span>{label}</span>}
    </div>
  );
}
