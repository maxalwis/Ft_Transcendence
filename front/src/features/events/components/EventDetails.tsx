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

// La fonction accepte maintenant une locale directement
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
    
    // Détermination de la locale pour toLocaleDateString en fonction de la langue active
    const currentLocale = i18n.language === 'es' ? 'es-ES' : i18n.language === 'en' ? 'en-US' : 'fr-FR';

    const rawPriceType = cleanText(priceType).toLowerCase();
    
    let translatedPriceType = formatPriceType(priceType);
    if (rawPriceType.includes('gratuit') || rawPriceType.includes('free') || rawPriceType.includes('gratis')) {
      translatedPriceType = t('filters.free', 'Gratuit');
    } else if (rawPriceType.includes('payant') || rawPriceType.includes('fee') || rawPriceType.includes('pago')) {
      translatedPriceType = t('filters.feeBased', 'Payant');
    }

    const cleanedPriceDetail = cleanText(priceDetail);
    const isPaid = rawPriceType.includes('payant') || rawPriceType.includes('fee') || rawPriceType.includes('pago');

    // Textes traduits pour les dates
    const unknownDateText = t('events.unknownDate', 'Date inconnue');

    return (
    <div className="min-w-0 leading-tight">
        <h2 className="mb-2! font-extrabold! text-black/90!">{title}</h2>
        <p className="mb-1! text-sm font-semibold text-slate-600!">
          {category || t('events.defaultCategory', 'Événement')}
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
        <>
          <div className="mb-1 text-xs font-semibold text-slate-600">
              {t('events.linkLabel', 'Lien :')}
          </div>
          <a
              href={accessLink}
              target="_blank"
              rel="noreferrer"
              className="mb-1! block! text-xs! text-blue-900! underline!">
              {accessLink}
          </a>
        </>
        )}
    </div>
    );
}