import { useTranslation } from 'react-i18next';

import SideBar from '../../../layouts/Sidebar';
import EventSidebarContent from '../../events/components/EventSidebarContent';
import EventResultsSidebar, {
  type ResultsSearch,
} from '../../events/components/EventResultsSidebar';

import type { EventItem } from '../../../types/event';
import type { EventSortField, SortOrder } from '../../../api/events';

export type SidebarState = { type: 'event'; eventId: string } | { type: 'results' } | null;

interface MapSidebarPanelProps {
  sidebar: SidebarState;
  isOpen: boolean;
  currentUserId?: string | number;
  groupEvents: EventItem[] | null;
  search: ResultsSearch;
  onSortChange: (sort: EventSortField, order: SortOrder) => void;
  currentResultsPage: number;
  onPageChange: (page: number) => void;
  resultsScrollTop: number;
  onResultsScrollTopChange: (top: number) => void;
  onEventClick: (eventId: string) => void;
  onToggle: () => void;
  onClose: () => void;
  onBack?: () => void;
}

export default function MapSidebarPanel({
  sidebar,
  isOpen,
  currentUserId,
  groupEvents,
  search,
  onSortChange,
  currentResultsPage,
  onPageChange,
  resultsScrollTop,
  onResultsScrollTopChange,
  onEventClick,
  onToggle,
  onClose,
  onBack,
}: MapSidebarPanelProps) {
  const { t } = useTranslation();

  if (sidebar === null) return null;

  return (
    <SideBar
      isOpen={isOpen}
      title={sidebar.type === 'results' ? t('sidebar.results') : t('sidebar.event')}
      onToggle={onToggle}
      onClose={onClose}
      onBack={sidebar.type === 'event' ? onBack : undefined}
    >
      {sidebar.type === 'results' && (
        <EventResultsSidebar
          groupEvents={groupEvents}
          search={search}
          onSortChange={onSortChange}
          currentPage={currentResultsPage}
          onPageChange={onPageChange}
          onEventClick={onEventClick}
          scrollTop={resultsScrollTop}
          onScrollTopChange={onResultsScrollTopChange}
        />
      )}

      {sidebar.type === 'event' && (
        <EventSidebarContent eventId={sidebar.eventId} currentUserId={currentUserId} />
      )}
    </SideBar>
  );
}
