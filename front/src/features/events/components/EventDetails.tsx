import { useTranslation } from 'react-i18next';
import Button from '../../../components/ui/Button';
import { BackIcon, ExternalLinkIcon } from '../../../types/icons';

interface EventDetailsProps {
  title?: string;
  isTranslating?: boolean;
  category?: string;
  dateStart?: string;
  dateEnd?: string;
  priceType?: string;
  priceDetail?: string;
  accessLink?: string;
  onBack?: () => void;
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
  isTranslating = false,
  category,
  dateStart,
  dateEnd,
  priceType,
  priceDetail,
  accessLink,
  onBack,
}: EventDetailsProps) {
  const { t, i18n } = useTranslation();

  // Map i18n language to browser locale string
  const currentLocale =
    i18n.language === 'es'
      ? 'es-ES'
      : i18n.language === 'en'
        ? 'en-US'
        : i18n.language === 'ar'
          ? 'ar-SA'
          : 'fr-FR';

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
      {onBack && (
        <Button
          variant="ghost"
          type="button"
          onClick={onBack}
          aria-label={t('common.back')}
          className="mb-3 flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-black"
        >
          <BackIcon className="h-4 w-4" />
          <span>{t('common.back')}</span>
        </Button>
      )}

      {isTranslating ? (
        <div className="mb-2 h-6 w-3/4 animate-pulse rounded bg-slate-200" />
      ) : (
        <h2 className="mb-2! font-extrabold! text-black/90!">{title}</h2>
      )}
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
            <ExternalLinkIcon className="h-4 w-4"/>
          </a>
        </div>
      )}
    </div>
  );
}
