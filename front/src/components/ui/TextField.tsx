import { InputHTMLAttributes, useId } from 'react';

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  containerClassName?: string;
}

export default function TextField({
  label,
  error,
  id,
  className = '',
  containerClassName = '',
  ...props
}: TextFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <div className={`ds-field ${containerClassName}`}>
      {label && (
        <label className="ds-field-label" htmlFor={inputId}>
          {label}
        </label>
      )}

      <input
        id={inputId}
        className={`ds-input ${error ? 'ds-field-error' : ''} ${className}`}
        aria-invalid={Boolean(error)}
        {...props}
      />

      {error && <span className="ds-field-error-text">{error}</span>}
    </div>
  );
}
