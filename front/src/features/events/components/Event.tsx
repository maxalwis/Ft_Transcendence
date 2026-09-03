import type { EventItem } from '../../../types/event';
import EventDetails from './EventDetails';
import EventImage from './EventImage';
import LikeButton from './LikeButton';

interface EventProps {
  event: EventItem;
}

export default function Event({ event }: EventProps) {
  return (
    <div className="flex h-full flex-col gap-1 overflow-y-auto">
      <EventImage src={event.coverUrl} alt={event.title} />
      <EventDetails
        title={event.title}
        category={event.category?.[0]}
        dateStart={event.dateStart}
        dateEnd={event.dateEnd}
        priceType={event.priceType}
        priceDetail={event.priceDetail}
        accessLink={event.accessLink}
      />
      <div className="flex items-center">
        <LikeButton eventId={event.id} interestedUsersCount={event.interestedUsersCount} />
      </div>
    </div>
  );
}
