import { useTranslation } from 'react-i18next';

interface EventDetailsProps {
  title: string;
  category?: string;
  dateStart?: string;
  dateEnd?: string;
  priceType?: string;
  priceDetail?: string;
  accessLink?: string;
}

function formatDate(value?: string, locale = 'fr-FR', unknownText = 'Date inconnue') {
  if (!value) return unknownText;

  const date = new Date(value);
  if (isNaN(date.getTime())) return unknownText;

  return date.toLocaleDateString(locale, {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
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

function formatPriceType(value?: string) {
  const text = cleanText(value);
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

export default function EventDetails({
  title,
  category,
  dateStart,
  dateEnd,
  priceType,
  priceDetail,
  accessLink,
}: EventDetailsProps) {
  const { t, i18n } = useTranslation();

  // Map i18n language to browser locale string
  const currentLocale =
    i18n.language === 'es' ? 'es-ES' : i18n.language === 'en' ? 'en-US' : 'fr-FR';

  const rawPriceType = cleanText(priceType).toLowerCase();

  let translatedPriceType = formatPriceType(priceType);
  if (
    rawPriceType.includes('gratuit') ||
    rawPriceType.includes('free') ||
    rawPriceType.includes('gratis')
  ) {
    translatedPriceType = t('eventDetails.price.free');
  } else if (
    rawPriceType.includes('payant') ||
    rawPriceType.includes('fee') ||
    rawPriceType.includes('pago')
  ) {
    translatedPriceType = t('eventDetails.price.feeBased');
  }

  const cleanedPriceDetail = cleanText(priceDetail);
  const isPaid =
    rawPriceType.includes('payant') ||
    rawPriceType.includes('fee') ||
    rawPriceType.includes('pago');

  const unknownDateText = t('eventDetails.unknownDate');

  return (
    <div className="min-w-0 leading-tight">
      <h2 className="mb-2! font-extrabold! text-black/90!">{title}</h2>
      <p className="mb-1! text-sm font-semibold text-slate-600!">
        {category || t('eventDetails.defaultCategory')}
      </p>
      <p className="mb-1! text-xs">
        {formatDate(dateStart, currentLocale, unknownDateText)}
        {dateEnd ? ` - ${formatDate(dateEnd, currentLocale, unknownDateText)}` : ''}
      </p>
      {translatedPriceType && (
        <p className="mb-1! text-xs text-slate-200">
          {translatedPriceType}
          {isPaid && cleanedPriceDetail ? ` - ${cleanedPriceDetail}` : ''}
        </p>
      )}
      {accessLink && (
        <div className="mt-3 flex justify-center">
          <a
            href={accessLink}
            target="_blank"
            rel="noreferrer"
            style={{
              background: 'var(--color-orange-secondary)',
              backdropFilter: 'var(--glass-blur)',
              WebkitBackdropFilter: 'var(--glass-blur)',
              border: '1px solid var(--glass-border)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--color-text-light)',
            }}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold transition-all duration-200 active:scale-95"
          >
            <span>{t('eventDetails.accessLink')}</span>
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
              />
            </svg>
          </a>
        </div>
      )}
    </div>
  );
}
