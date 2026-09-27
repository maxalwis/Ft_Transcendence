import EventPreview from '../../events/components/EventPreview';
import type { EventItem, EventGroup } from '../../../types/event';

interface MapHoverPreviewProps {
  currentEvent: EventItem | null;
  activeGroup: EventGroup | null;
  hoverPos: { x: number; y: number } | null;
  title?: string;
  category?: string;
  isTranslating: boolean;
  activeEventIndex: number;
  onPrev: () => void;
  onNext: () => void;
  onClick: () => void;
  onOpenGroup: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

export default function MapHoverPreview({
  currentEvent,
  activeGroup,
  hoverPos,
  title,
  category,
  isTranslating,
  activeEventIndex,
  onPrev,
  onNext,
  onClick,
  onOpenGroup,
  onMouseEnter,
  onMouseLeave,
}: MapHoverPreviewProps) {
  if (!currentEvent || !activeGroup || !hoverPos) return null;

  return (
    <EventPreview
      position={hoverPos}
      eventId={currentEvent.id}
      title={title}
      isTranslating={isTranslating}
      priceType={currentEvent.priceType}
      dateStart={currentEvent.dateStart}
      dateEnd={currentEvent.dateEnd}
      category={category || 'Event'}
      isOpen={true}
      interestedUsersCount={currentEvent.interestedUsersCount || 0}
      imageUrl={currentEvent.coverUrl}
      totalInGroup={activeGroup.events.length}
      currentIndex={activeEventIndex}
      onPrev={onPrev}
      onNext={onNext}
      onClick={onClick}
      onOpenGroup={onOpenGroup}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    />
  );
}
