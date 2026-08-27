export interface EventItem {
  id: string;
  title: string;
  latitude: number | string;
  longitude: number | string;
  category?: string[];
  dateStart?: string;
  dateEnd?: string;
  coverUrl?: string;
  isNew?: boolean;
  interestedUsersCount?: number;
  price?: number;
  priceDetail?: string; // Ajouté
  priceType?: string;   // Ajouté
}

export interface EventGroup {
  id: string;
  latitude: number;
  longitude: number;
  events: EventItem[];
}

export type EventFilters = {
  city: string;
  startDate: string;
  endDate: string;
  priceType: string;
  category?: string;
  minPrice?: number | string;
  maxPrice?: number | string;
};