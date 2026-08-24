import type { EventItem } from '../../../types/event';
import EventDetails from './EventDetails';
import EventImage from './EventImage';
import LikeButton from './LikeButton';

interface EventProps {
  event: EventItem;
}

export default function Event({ event }: EventProps) {
  return (
    <div className="flex h-full flex-col gap-3 overflow-hidden">
      <EventImage src={event.coverUrl} alt={event.title} />
      <EventDetails
        title={event.title}
        category={event.category?.[0]}
        dateStart={event.dateStart}
        dateEnd={event.dateEnd}
      />
      <LikeButton eventId={event.id} interestedUsersCount={event.interestedUsersCount} />
    </div>
  );
}
