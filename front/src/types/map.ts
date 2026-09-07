import type { EventFilters } from './event';

export type FiltersProps = {
  onApplyFilters?: (filters: EventFilters) => void;
};
