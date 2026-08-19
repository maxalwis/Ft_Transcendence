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