interface EventDetailsProps {
  title: string;
  category?: string;
  dateStart?: string;
  dateEnd?: string;
  priceType?: string;
  priceDetail?: string;
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
}: EventDetailsProps) {
  const formattedPriceType = formatPriceType(priceType);
  const cleanedPriceDetail = cleanText(priceDetail);
  const isPaid = formattedPriceType.toLowerCase().includes('payant');

  return (
    <div className="min-w-0 leading-tight">
      <h2 className="text-base font-semibold text-white">{title}</h2>
      <p className="!mb-1 text-xs text-slate-300">{category || 'Événement'}</p>
      <p className="!mb-1 text-xs text-slate-200">
        {formatDate(dateStart)}
        {dateEnd ? ` - ${formatDate(dateEnd)}` : ''}
      </p>
      {formattedPriceType && (
        <p className="!mb-1 text-xs text-slate-200">
          {formattedPriceType}
          {isPaid && cleanedPriceDetail ? ` - ${cleanedPriceDetail}` : ''}
        </p>
      )}
    </div>
  );
}
