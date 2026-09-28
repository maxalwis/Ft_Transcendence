import { useEffect, useRef, useState } from 'react';
import type { EventItem } from '../../../types/event';
import EventResultCard from './EventResultCard';
import styles from '../Event.module.css';
import { useTranslation } from 'react-i18next';
import Button from '../../../components/ui/Button';
import EmptyState from '../../../components/ui/EmptyState';
import Select from '../../../components/ui/Select';
import Pagination from '../../../components/ui/Pagination';
import Spinner from '../../../components/ui/Spinner';
import { ArrowDownIcon, ArrowUpIcon } from '../../../types/icons';
import { useEventSearch } from '../hooks/useEventSearch';
import type { EventSearchParams, EventSortField, SortOrder } from '../../../api/events';

export type ResultsSearch = Omit<EventSearchParams, 'page' | 'limit'>;

interface EventResultsSidebarProps {
  // Events of a clicked marker group, listed as is. When null, the list comes from the
  // server search (filters + text + sort + pagination).
  groupEvents: EventItem[] | null;
  search: ResultsSearch;
  onSortChange: (sort: EventSortField, order: SortOrder) => void;
  currentPage: number;
  onPageChange: (page: number) => void;
  onEventClick: (eventId: string) => void;
  scrollTop: number;
  onScrollTopChange: (scrollTop: number) => void;
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 900);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 900px)');

    const handleChange = () => {
      setIsMobile(mediaQuery.matches);
    };

    handleChange();
    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  return isMobile;
}

export default function EventResultsSidebar({
  groupEvents,
  search,
  onSortChange,
  currentPage,
  onPageChange,
  onEventClick,
  scrollTop,
  onScrollTopChange,
}: EventResultsSidebarProps) {
  const { t } = useTranslation();
  const [eventsPerPage, setEventsPerPage] = useState(4);
  const [hasOverflow, setHasOverflow] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [isAtTop, setIsAtTop] = useState(true);
  const listRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const itemsPerPage = isMobile ? 5 : eventsPerPage;
  const isGroup = groupEvents !== null;

  const {
    result,
    isLoading: isSearching,
    error: searchError,
  } = useEventSearch({ ...search, page: currentPage, limit: itemsPerPage }, !isGroup);

  let paginatedEvents: EventItem[];
  let totalPages: number;
  let totalCount: number;

  if (isGroup) {
    const startIndex = (currentPage - 1) * itemsPerPage;
    paginatedEvents = groupEvents.slice(startIndex, startIndex + itemsPerPage);
    totalPages = Math.max(1, Math.ceil(groupEvents.length / itemsPerPage));
    totalCount = groupEvents.length;
  } else {
    paginatedEvents = result?.data ?? [];
    totalPages = result?.totalPages ?? 1;
    totalCount = result?.total ?? 0;
  }

  const isLoading = !isGroup && isSearching && !result;
  const hasResults = paginatedEvents.length > 0;

  // The page size depends on the sidebar height: when it grows, the current page may no
  // longer exist.
  useEffect(() => {
    if (currentPage > totalPages) onPageChange(totalPages);
  }, [currentPage, totalPages, onPageChange]);

  const sortOptions = [
    { value: 'date', label: t('search.sort.date') },
    { value: 'title', label: t('search.sort.title') },
    { value: 'popularity', label: t('search.sort.popularity') },
  ];

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
    if (isMobile) return;

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

      const count = Math.max(1, Math.floor((containerHeight + gap + 10) / (cardHeight + gap)));

      setEventsPerPage((previous) => (previous === count ? previous : count));
    };

    calculateEventsPerPage();

    const observer = new ResizeObserver(calculateEventsPerPage);
    observer.observe(list);

    return () => {
      observer.disconnect();
    };
  }, [hasResults, isMobile]);

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
      setIsAtTop(list.scrollTop <= 0);
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

  const orderLabel = search.order === 'asc' ? t('search.order.asc') : t('search.order.desc');

  const sortControls = !isGroup && (
    <div className="flex shrink-0 items-end gap-2 pb-2">
      <div className="min-w-0 flex-1">
        <Select
          label={t('search.sort.label')}
          options={sortOptions}
          value={search.sort}
          onChange={(value) => onSortChange(value as EventSortField, search.order)}
        />
      </div>
      <Button
        variant="icon"
        type="button"
        onClick={() => onSortChange(search.sort, search.order === 'asc' ? 'desc' : 'asc')}
        className="modal-button orange-surrounded"
        aria-label={orderLabel}
        title={orderLabel}
      >
        {search.order === 'asc' ? (
          <ArrowUpIcon className="h-4 w-4" />
        ) : (
          <ArrowDownIcon className="h-4 w-4" />
        )}
      </Button>
    </div>
  );

  if (isLoading) {
    return (
      <EmptyState>
        <Spinner label={t('events.loading')} />
      </EmptyState>
    );
  }

  if (!isGroup && searchError && !result) {
    return <EmptyState>{t('events.errors.searchFailed')}</EmptyState>;
  }

  if (paginatedEvents.length === 0) {
    return (
      <div className={styles.resultsWrapper}>
        {sortControls}
        <EmptyState>{t('events.noEvents')}</EmptyState>
      </div>
    );
  }

  return (
    <div className={styles.resultsWrapper}>
      {sortControls}
      <p className="shrink-0 pb-2 text-sm opacity-75" aria-live="polite">
        {t('search.resultsCount', { count: totalCount })}
      </p>
      <div
        className={`${styles.resultsList} ${
          hasOverflow && !isAtBottom ? styles.hasBottomFade : ''
        } ${hasOverflow && !isAtTop ? styles.hasTopFade : ''}`}
      >
        <div ref={listRef} className="flex h-full flex-col gap-2 overflow-y-auto">
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

      <Pagination
        current={currentPage}
        total={totalPages}
        onPrevious={() => handlePageChange(currentPage - 1)}
        onNext={() => handlePageChange(currentPage + 1)}
        className="shrink-0"
        buttonClassName="modal-button orange-surrounded"
      />
    </div>
  );
}
