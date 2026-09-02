import type { EventItem } from '../../../types/event';
import EventDetails from './EventDetails';
import EventImage from './EventImage';
import LikeButton from './LikeButton';
import { useLanguage } from '../../../context/language/LanguageContext';
import { useTranslatedEvent } from '../hooks/useTranslatedEvent';
interface EventProps {
  event: EventItem;
}

export default function Event({ event }: EventProps) {
  const { lang } = useLanguage();
  const { data: translated, loading } = useTranslatedEvent(event.id, lang);
  const isTranslating = lang !== 'fr' && loading && !translated;
  const displayedTitle = isTranslating ? undefined : (translated?.title ?? event.title);
  const displayedPriceDetail = isTranslating ? undefined : (translated?.priceDetail ?? event.priceDetail);

  return (
    <div className="flex h-full flex-col gap-1 overflow-y-auto">
      <EventImage src={event.coverUrl} alt={event.title} />
      <EventDetails
        title={displayedTitle}
        isTranslating={isTranslating}
        category={event.category?.[0]}
        dateStart={event.dateStart}
        dateEnd={event.dateEnd}
        priceType={event.priceType}
        priceDetail={displayedPriceDetail}
        accessLink={event.accessLink}
      />
      <div className="flex items-center justify-center">
        <LikeButton eventId={event.id} interestedUsersCount={event.interestedUsersCount} />
      </div>
    </div>
  );
}
