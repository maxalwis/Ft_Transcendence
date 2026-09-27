import type { HTMLAttributes } from 'react';

type BadgeVariant = 'neutral' | 'primary' | 'success';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export default function Badge({
  variant = 'neutral',
  className = '',
  children,
  ...props
}: BadgeProps) {
  return (
    <span className={`ds-badge ds-badge-${variant} ${className}`} {...props}>
      {children}
    </span>
  );
}
