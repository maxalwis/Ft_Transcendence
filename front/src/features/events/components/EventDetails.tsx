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

export default function EventDetails({
  title,
  category,
  dateStart,
  dateEnd,
  priceType,
  priceDetail,
}: EventDetailsProps) {
  const isPaid = priceType?.toLowerCase().includes('payant');

  return (
    <div className="min-w-0">
      <h2 className="truncate text-base font-semibold text-white">{title}</h2>
      <p className="mt-1 truncate text-xs text-slate-300">{category || 'Événement'}</p>
      <p className="mt-2 text-xs text-slate-200">
        {formatDate(dateStart)}
        {dateEnd ? ` - ${formatDate(dateEnd)}` : ''}
      </p>
      {priceType && (
        <p className="mt-1 truncate text-xs text-slate-200">
          {priceType}
          {isPaid && priceDetail ? ` - ${priceDetail}` : ''}
        </p>
      )}
    </div>
  );
}
