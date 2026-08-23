import type { EventFilters, EventItem } from './event';

export type FiltersProps = {
  onApplyFilters?: (filters: EventFilters) => void;
};