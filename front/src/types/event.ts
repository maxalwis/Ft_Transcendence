export interface EventItem {
  id: string;
  title: string;
  latitude: number;
  longitude: number;
  category?: string[];
  dateStart?: string;
  dateEnd?: string;
  coverUrl?: string;
  isNew?: boolean;
  interestedUsersCount?: number;
}

export interface EventGroup {
  id: string; // Spatial key `${lat.toFixed(4)},${lng.toFixed(4)}`
  latitude: number;
  longitude: number;
  events: EventItem[];
}

export type EventFilters = {
  city: string;
  startDate: string;
  endDate: string;
  priceType: string;
}