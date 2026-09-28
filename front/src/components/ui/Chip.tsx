import type { HTMLAttributes } from 'react';

export default function Chip({
  className = '',
  children,
  ...props
}: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span className={`ds-chip ${className}`} {...props}>
      {children}
    </span>
  );
}
