import { useEffect, useRef, useState } from 'react';
import type { EventItem } from '../../../types/event';
import EventResultCard from './EventResultCard';
import EventSidebarContent from './EventSidebarContent';
import styles from '../Event.module.css';

interface EventResultsSidebarProps {
  events: EventItem[];
  isLoading: boolean;
  currentUserId?: string;
}

export default function EventResultsSidebar({
  events,
  isLoading,
  currentUserId,
}: EventResultsSidebarProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [eventsPerPage, setEventsPerPage] = useState(1);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [hasOverflow, setHasOverflow] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);

  const listRef = useRef<HTMLDivElement>(null);

  const totalPages = Math.max(1, Math.ceil(events.length / eventsPerPage));

  const startIndex = (currentPage - 1) * eventsPerPage;

  const paginatedEvents = events.slice(startIndex, startIndex + eventsPerPage);

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

      const { rowGap } = window.getComputedStyle(list);
      const gap = parseFloat(rowGap) || 0;

      if (containerHeight <= 0 || cardHeight <= 0) return;

      const count = Math.max(1, Math.floor((containerHeight + gap) / (cardHeight + gap))) + 1;

      setEventsPerPage((previous) => (previous === count ? previous : count));
    };

    calculateEventsPerPage();

    const observer = new ResizeObserver(calculateEventsPerPage);

    observer.observe(list);

    return () => observer.disconnect();
  }, [events]);

  useEffect(() => {
    const list = listRef.current;

    if (!list) return;

    const updateScrollState = () => {
      const hasOverflow = list.scrollHeight > list.clientHeight + 1;
      const isAtBottom = list.scrollTop + list.clientHeight >= list.scrollHeight - 1;

      setHasOverflow(hasOverflow);
      setIsAtBottom(isAtBottom);
    };

    updateScrollState();

    list.addEventListener('scroll', updateScrollState, { passive: true });

    const observer = new ResizeObserver(updateScrollState);
    observer.observe(list);

    Array.from(list.children).forEach((child) => {
      observer.observe(child);
    });

    return () => {
      list.removeEventListener('scroll', updateScrollState);
      observer.disconnect();
    };
  }, [paginatedEvents]);

  if (selectedEventId) {
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        <button
          type="button"
          onClick={() => setSelectedEventId(null)}
          aria-label="Back to results"
          className="modal-button modal-back"
        >
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <EventSidebarContent eventId={selectedEventId} currentUserId={currentUserId} />
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <div className="flex-1 flex items-center justify-center text-gray-400">Loading...</div>;
  }

  if (events.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
        No events found.
      </div>
    );
  }

  return (
    <div className={styles.resultsWrapper}>
      <div
        className={`${styles.resultsList} ${
          hasOverflow && !isAtBottom ? styles.hasBottomFade : ''
        }`}
      >
        <div ref={listRef} className="h-full overflow-y-auto flex flex-col gap-2">
          {paginatedEvents.map((event) => (
            <EventResultCard
              key={event.id}
              event={event}
              onClick={() => setSelectedEventId(event.id)}
            />
          ))}
        </div>
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
