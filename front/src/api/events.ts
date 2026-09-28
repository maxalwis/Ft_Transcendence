import { request } from './api';
import type { EventItem } from '../types/event';

export type EventSortField = 'date' | 'title' | 'popularity';
export type SortOrder = 'asc' | 'desc';

export interface EventSearchParams {
  q?: string;
  city?: string;
  from?: string;
  category?: string;
  price?: string;
  sort: EventSortField;
  order: SortOrder;
  page: number;
  limit: number;
}

export interface EventSearchItem extends EventItem {
  interestCount: number;
}

export interface EventSearchResult {
  data: EventSearchItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// GET /events/search: filters + full-text search + sort + server-side pagination
export async function searchEvents(
  params: EventSearchParams,
  signal?: AbortSignal
): Promise<EventSearchResult> {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') query.append(key, String(value));
  });

  const res = await request(`/events/search?${query.toString()}`, { signal });
  if (!res.ok) throw new Error('EVENTS_SEARCH_FAILED');
  return res.json();
}
