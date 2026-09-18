export interface EventItem {
  id: string;
  title: string;
  latitude: number | string;
  longitude: number | string;
  category?: string[];
  dateStart?: string;
  dateEnd?: string;
  coverUrl?: string;
  priceType?: string;
  priceDetail?: string;
  accessLink?: string;
  isNew?: boolean;
  interestedUsersCount?: number;
  price?: number;
}

export interface EventGroup {
  id: string;
  latitude: number;
  longitude: number;
  events: EventItem[];
}

export type EventFilters = {
  startDate: string;
  endDate: string;
  priceType: string;
  category?: string;
  minPrice?: number | string;
  maxPrice?: number | string;
};
