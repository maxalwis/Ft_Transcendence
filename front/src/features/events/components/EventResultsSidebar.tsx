import { useEffect, useRef, useState } from 'react';
import type { EventItem } from '../../../types/event';
import EventResultCard from './EventResultCard';

interface EventResultsSidebarProps {
  events: EventItem[];
  isLoading: boolean;
  onEventClick: (eventId: string) => void;
}

export default function EventResultsSidebar({
  events,
  isLoading,
  onEventClick,
}: EventResultsSidebarProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [eventsPerPage, setEventsPerPage] = useState(1);

  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCurrentPage(1);
  }, [events]);

  useEffect(() => {
    const list = listRef.current;

    if (!list) return;

    const calculateEventsPerPage = () => {
      const firstCard = list.firstElementChild as HTMLElement | null;

      if (!firstCard) return;

      const containerHeight = list.clientHeight;
      const cardHeight = firstCard.getBoundingClientRect().height;
      const styles = window.getComputedStyle(list);
      const gap = parseFloat(styles.rowGap || styles.gap) || 0;

      if (cardHeight <= 0) return;

      const count = Math.max(
        1,
        Math.floor((containerHeight + gap) / (cardHeight + gap)),
      );

      setEventsPerPage(count);
    };

    calculateEventsPerPage();

    const observer = new ResizeObserver(calculateEventsPerPage);
    observer.observe(list);

    return () => observer.disconnect();
  }, [events]);

  const totalPages = Math.max(
    1,
    Math.ceil(events.length / eventsPerPage),
  );

  const startIndex = (currentPage - 1) * eventsPerPage;

  const paginatedEvents = events.slice(
    startIndex,
    startIndex + eventsPerPage,
  );

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400">
        Loading...
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
        No events found.
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div
        ref={listRef}
        className="flex-1 overflow-hidden flex flex-col gap-2"
      >
        {paginatedEvents.map((event) => (
          <EventResultCard
            key={event.id}
            event={event}
            onClick={onEventClick}
          />
        ))}
      </div>

      <div className="shrink-0 flex items-center justify-between">
        <button
          type="button"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((page) => page - 1)}
          aria-label="Previous page"
        >
          &lt;
        </button>

        <span>
          {currentPage} / {totalPages}
        </span>

        <button
          type="button"
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((page) => page + 1)}
          aria-label="Next page"
        >
          &gt;
        </button>
      </div>
    </div>
  );
}