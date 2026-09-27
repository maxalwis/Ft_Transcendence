import type { HTMLAttributes } from 'react';

interface EmptyStateProps extends HTMLAttributes<HTMLDivElement> {
  italic?: boolean;
}

export default function EmptyState({
  italic = false,
  className = '',
  children,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={`ds-empty-state ${italic ? 'ds-empty-state-italic' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
