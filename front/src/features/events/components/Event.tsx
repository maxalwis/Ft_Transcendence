import type { EventItem } from '../../../types/event';
import EventDetails from './EventDetails';
import EventImage from './EventImage';
import LikeButton from './LikeButton';
import { useTranslation } from 'react-i18next';
import { useTranslatedEvent } from '../hooks/useTranslatedEvent';
import { useEventRoom } from '../hooks/useEventRoom';
interface EventProps {
  event: EventItem;
}

export default function Event({ event }: EventProps) {
  const { i18n } = useTranslation();
  const lang = i18n.language;
  const { data: translated, loading } = useTranslatedEvent(event.id, lang);
  const isTranslating = lang !== 'fr' && loading && !translated;
  const displayedTitle = isTranslating ? undefined : (translated?.title ?? event.title);
  const displayedPriceDetail = isTranslating
    ? undefined
    : (translated?.priceDetail ?? event.priceDetail);
  const displayedCategory = isTranslating
    ? undefined
    : ((translated?.category as unknown as string[])?.[0] ?? event.category?.[0]);

  useEventRoom(event.id);

  return (
    <div className="flex h-full flex-col gap-1 overflow-y-auto">
      <EventImage src={event.coverUrl} alt={event.title} />
      <EventDetails
        title={displayedTitle}
        isTranslating={isTranslating}
        category={displayedCategory}
        dateStart={event.dateStart}
        dateEnd={event.dateEnd}
        priceType={event.priceType}
        priceDetail={displayedPriceDetail}
        accessLink={event.accessLink}
      />
      <div className="flex items-center">
        <LikeButton eventId={event.id} interestedUsersCount={event.interestedUsersCount} />
      </div>
    </div>
  );
}
