import React from 'react';
import { useTranslation } from 'react-i18next';

import type { EventItem } from '../../../types/event';
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

function formatTime(value?: string, locale = 'fr-FR', undefinedText = 'Undefined time') {
  if (!value) return '';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return undefinedText;
  }

  return date.toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function EventResultCard({ event, onClick }: EventResultCardProps) {
  const { t, i18n } = useTranslation();

  const currentLocale = (() => {
    switch (i18n.language) {
      case 'es':
        return 'es-ES';
      case 'en':
        return 'en-US';
      case 'ar':
        return 'ar-SA';
      default:
        return 'fr-FR';
    }
  })();

  const undefinedDateText = t('eventPreview.undefinedDate');

  const normalizedPrice = event.priceType?.trim().toLowerCase();

  const formattedPrice =
    normalizedPrice === 'payant'
      ? React.createElement(PriceIcon, { paid: true })
      : normalizedPrice?.includes('gratuit')
        ? React.createElement(PriceIcon, { paid: false })
        : event.priceType?.trim() || t('eventPreview.price.unspecified');

  const category = event.category?.[0] || t('categories.others', 'Autres');

  const handleClick = () => {
    onClick(event.id);
  };

  return (
    <article onClick={handleClick} className="glass-article cursor-pointer transition-all">
      <div className="flex flex-col gap-3">
        {/* Event image */}
        <div className="shrink-0 overflow-hidden rounded-lg">
          <img
            src={event.coverUrl || '/event_image.webp'}
            alt={event.title || t('eventPreview.defaultAlt')}
            className="w-full object-cover"
          />
        </div>

        {/* Event content */}
        <div className="min-w-0 leading-tight">
          <h2 className="mb-1! line-clamp-2">{event.title}</h2>

          <div className="flex items-center justify-between gap-2">
            <p className="mb-3! text-xs">
              {category || t('eventDetails.defaultCategory')}
            </p>
            <p className="mb-3!">
              {formattedPrice}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}
