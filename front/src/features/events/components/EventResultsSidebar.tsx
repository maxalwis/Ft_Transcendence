import { useEffect, useRef, useState } from 'react';
import type { EventItem } from '../../../types/event';
import EventResultCard from './EventResultCard';
import styles from '../Event.module.css';
import { useTranslation } from 'react-i18next';

interface EventResultsSidebarProps {
  events: EventItem[];
  isLoading: boolean;
  currentPage: number;
  onPageChange: (page: number) => void;
  onEventClick: (eventId: string) => void;
  scrollTop: number;
  onScrollTopChange: (scrollTop: number) => void;
}

export default function EventResultsSidebar({
  events,
  isLoading,
  currentPage,
  onPageChange,
  onEventClick,
  scrollTop,
  onScrollTopChange,
}: EventResultsSidebarProps) {
  const { t } = useTranslation();
  const [eventsPerPage, setEventsPerPage] = useState(1);
  const [hasOverflow, setHasOverflow] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const listRef = useRef<HTMLDivElement>(null);
  const isMobile = window.innerWidth <= 900;
  const itemsPerPage = isMobile ? 5 : eventsPerPage;
  const totalPages = Math.max(1, Math.ceil(events.length / (isMobile ? 5 : eventsPerPage)));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEvents = events.slice(startIndex, startIndex + itemsPerPage);
  const handlePageChange = (page: number) => {
    onScrollTopChange(0);
    onPageChange(page);
  };

  /*
   * Calculate how many cards fit in the available sidebar height.
   *
   * This depends on the layout, not on the current page.
   * The cards therefore need to have a consistent height.
   */
  useEffect(() => {
    const list = listRef.current;

    if (!list) return;

    const calculateEventsPerPage = () => {
      const firstCard = list.firstElementChild as HTMLElement | null;

      if (!firstCard) return;

      const containerHeight = list.clientHeight;
      const cardHeight = firstCard.offsetHeight;

      const { rowGap } = window.getComputedStyle(list);
      const gap = parseFloat(rowGap) || 0;

      if (containerHeight <= 0 || cardHeight <= 0) return;

      const count = Math.max(1, Math.floor((containerHeight + gap) / (cardHeight + gap)));

      setEventsPerPage((previous) => (previous === count ? previous : count));
    };

    calculateEventsPerPage();

    const observer = new ResizeObserver(calculateEventsPerPage);
    observer.observe(list);

    return () => {
      observer.disconnect();
    };
  }, [events]);

  /*
   * Track whether the results list is overflowing and whether
   * the user has reached the bottom, so the bottom fade can be shown.
   */
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

    list.addEventListener('scroll', updateScrollState, {
      passive: true,
    });

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

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      listRef.current?.scrollTo({
        top: scrollTop,
        behavior: 'auto',
      });
    });

    return () => cancelAnimationFrame(frame);
  }, [scrollTop]);

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center text-gray-400">
        {t('events.loading')}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-gray-400">
        {t('events.noEvents')}
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
        <div ref={listRef} className="flex h-full max-h-[70vh] flex-col gap-2 overflow-y-auto">
          {paginatedEvents.map((event) => (
            <EventResultCard
              key={event.id}
              event={event}
              onClick={() => {
                onScrollTopChange(listRef.current?.scrollTop ?? 0);
                onEventClick(event.id);
              }}
            />
          ))}
        </div>
      </div>

      <div className="flex shrink-0 items-center justify-between">
        <button
          type="button"
          disabled={currentPage === 1}
          onClick={() => handlePageChange(currentPage - 1)}
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
          onClick={() => handlePageChange(currentPage + 1)}
          aria-label="Next page"
        >
          &gt;
        </button>
      </div>
    </div>
  );
}
