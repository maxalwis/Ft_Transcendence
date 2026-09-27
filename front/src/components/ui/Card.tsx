import type { HTMLAttributes } from 'react';

type CardVariant = 'panel' | 'article';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  as?: 'div' | 'article';
}

export default function Card({
  variant = 'panel',
  as,
  className = '',
  children,
  onClick,
  ...props
}: CardProps) {
  const tag = as ?? (variant === 'article' ? 'article' : 'div');
  const fullClassName = `ds-card ds-card-${variant} ${onClick ? 'ds-card-interactive' : ''} ${className}`;

  if (tag === 'article') {
    return (
      <article className={fullClassName} onClick={onClick} {...props}>
        {children}
      </article>
    );
  }

  return (
    <div className={fullClassName} onClick={onClick} {...props}>
      {children}
    </div>
  );
}
