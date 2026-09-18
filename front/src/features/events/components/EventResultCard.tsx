import { useTranslation } from 'react-i18next';

import type { EventItem } from '../../../types/event';
import { useTranslatedEvent } from '../hooks/useTranslatedEvent';
import { PriceIcon } from './PriceIcon';

interface EventResultCardProps {
  event: EventItem;
  onClick: (eventId: string) => void;
}

function formatDate(value?: string, locale = 'fr-FR', undefinedText = 'Undefined date') {
  if (!value) return undefinedText;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return undefinedText;
  }

  return date.toLocaleDateString(locale, {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
  });
}

function cleanText(value?: string) {
  if (!value) return '';

  return value
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;|&#160;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export default function EventResultCard({ event, onClick }: EventResultCardProps) {
  const { t, i18n } = useTranslation();

  const lang = i18n.language;

  const { data: translated, loading } = useTranslatedEvent(event.id, lang);

  const isTranslating = lang !== 'fr' && loading && !translated;

  const currentLocale =
    lang === 'es' ? 'es-ES' : lang === 'en' ? 'en-US' : lang === 'ar' ? 'ar-SA' : 'fr-FR';

  const undefinedDateText = t('eventPreview.undefinedDate');

  /*
   * Use the translated values when available.
   * While translation is loading, keep the original French
   * data rather than displaying partially translated content.
   */
  const displayedTitle = isTranslating ? undefined : (translated?.title ?? event.title);

  const displayedCategory = isTranslating
    ? undefined
    : ((translated?.category as unknown as string[])?.[0] ?? event.category?.[0]);

  const displayedPriceType = isTranslating ? undefined : (translated?.priceType ?? event.priceType);

  const eventDate = formatDate(event.dateStart, currentLocale, undefinedDateText);

  const rawPriceType = cleanText(displayedPriceType).toLowerCase();

  let isPaid: boolean | undefined;

  if (
    rawPriceType.includes('gratuit') ||
    rawPriceType.includes('free') ||
    rawPriceType.includes('gratis')
  ) {
    isPaid = false;
  } else if (
    rawPriceType.includes('payant') ||
    rawPriceType.includes('fee') ||
    rawPriceType.includes('pago')
  ) {
    isPaid = true;
  }

  const handleClick = () => {
    onClick(event.id);
  };

  return (
    <article
      onClick={handleClick}
      className="glass-article flex cursor-pointer flex-col transition-all"
    >
      <div className="flex flex-col">
        <div className="aspect-[15/11] shrink-0 overflow-hidden rounded-lg">
          <img
            src={event.coverUrl || '/event_image.webp'}
            alt={displayedTitle || t('eventPreview.defaultAlt')}
            className="h-full w-full object-cover"
          />
        </div>

        <div className="flex min-h-[76px] flex-col pt-3 leading-tight">
          {isTranslating ? (
            <div className="mb-1! h-5 w-3/4 animate-pulse rounded bg-slate-200" />
          ) : (
            <h2 className="line-clamp-2 leading-5">{displayedTitle}</h2>
          )}

          <div className="mt-auto flex items-center justify-between gap-2">
            <p className="mb-3! text-xs">{displayedCategory || t('categories.others')}</p>

            {isPaid !== undefined && (
              <p className="mb-3!">
                <PriceIcon paid={isPaid} />
              </p>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
