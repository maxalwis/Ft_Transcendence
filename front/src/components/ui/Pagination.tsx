import type { MouseEvent } from 'react';
import { useTranslation } from 'react-i18next';
import Button from './Button';
import { ArrowLeftIcon, ArrowRightIcon } from '../../types/icons';

interface PaginationProps {
  // 1-based
  current: number;
  total: number;
  onPrevious: (e: MouseEvent<HTMLButtonElement>) => void;
  onNext: (e: MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  buttonClassName?: string;
  counterClassName?: string;
}

/*
 * Previous / "n / total" / next. Arrows point to the inline start/end, so they are
 * mirrored in RTL; the counter itself always reads left to right.
 */
export default function Pagination({
  current,
  total,
  onPrevious,
  onNext,
  className = '',
  buttonClassName = '',
  counterClassName = '',
}: PaginationProps) {
  const { t } = useTranslation();

  return (
    <nav className={`ds-pagination ${className}`} aria-label={t('pagination.label')}>
      <Button
        variant="icon"
        type="button"
        disabled={current <= 1}
        onClick={onPrevious}
        className={buttonClassName}
        aria-label={t('pagination.previous')}
      >
        <ArrowLeftIcon className="h-4 w-4 rtl-flip" />
      </Button>

      <span dir="ltr" className={`ds-pagination-counter ${counterClassName}`}>
        {current} / {total}
      </span>

      <Button
        variant="icon"
        type="button"
        disabled={current >= total}
        onClick={onNext}
        className={buttonClassName}
        aria-label={t('pagination.next')}
      >
        <ArrowRightIcon className="h-4 w-4 rtl-flip" />
      </Button>
    </nav>
  );
}
