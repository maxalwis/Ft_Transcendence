interface EventDetailsProps {
  title?: string;
  isTranslating?: boolean;
  category?: string;
  dateStart?: string;
  dateEnd?: string;
  priceType?: string;
  priceDetail?: string;
  accessLink?: string;
}

function formatDate(value?: string) {
  if (!value) return 'Date inconnue';
  return new Date(value).toLocaleDateString('fr-FR', {
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
}: EventDetailsProps) {
  const formattedPriceType = formatPriceType(priceType);
  const cleanedPriceDetail = cleanText(priceDetail);
  const isPaid = formattedPriceType.toLowerCase().includes('payant');

  return (
    <div className="min-w-0 leading-tight">
      {isTranslating ? (
        <div className="mb-2 h-6 w-3/4 animate-pulse rounded bg-slate-200" />
      ) : (
        <h2 className="mb-2! font-extrabold! text-black/90!">{title}</h2>
      )}
      <p className="mb-1! text-sm font-semibold text-slate-600!">{category || 'Événement'}</p>
      <p className="mb-1! text-xs">
        {formatDate(dateStart)}
        {dateEnd ? ` - ${formatDate(dateEnd)}` : ''}
      </p>
      {formattedPriceType && (
        <p className="mb-1! text-xs text-slate-200">
          {formattedPriceType}
          {isPaid && cleanedPriceDetail ? ` - ${cleanedPriceDetail}` : ''}
        </p>
      )}
      {accessLink && (
        <>
          <div className="mb-1 text-xs font-semibold text-slate-600">Lien :</div>
          <a
            href={accessLink}
            target="_blank"
            rel="noreferrer"
            className="mb-1! block! text-xs! text-blue-900! underline!"
          >
            {accessLink}
          </a>
        </>
      )}
    </div>
  );
}
