import { request } from './api';

export interface EventInterest {
  userId: number;
  eventId: string;
}

export interface InterestStatus {
  isInterested: boolean;
  count: number;
}

export interface InterestedFriend {
  userId: number;
  eventId: string;
  user: {
    id: number;
    username: string;
    avatar?: string;
  };
}

export async function markInterested(eventId: string): Promise<EventInterest> {
  const res = await request(`/events/${eventId}/interest`, { method: 'POST' });
  if (!res.ok) throw new Error('INTEREST_ADD_FAILED');
  return res.json();
}

export async function removeInterest(eventId: string): Promise<void> {
  const res = await request(`/events/${eventId}/interest`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('INTEREST_REMOVE_FAILED');
}

export async function getInterestCount(eventId: string): Promise<number> {
  const res = await request(`/events/${eventId}/interest/count`);
  if (!res.ok) throw new Error('INTEREST_COUNT_FAILED');
  return res.json();
}

export async function getFriendsInterested(eventId: string): Promise<InterestedFriend[]> {
  const res = await request(`/events/${eventId}/interest/friends`);
  if (!res.ok) throw new Error('INTERESTED_FRIENDS_LOAD_FAILED');
  return res.json();
}

export async function isInterested(eventId: string): Promise<boolean> {
  const res = await request(`/events/${eventId}/interest/me`);
  if (!res.ok) throw new Error('INTEREST_CHECK_FAILED');
  return res.json();
}

export async function getInterestStatus(eventId: string): Promise<InterestStatus> {
  const res = await request(`/events/${eventId}/interest/status`);
  if (!res.ok) throw new Error('INTEREST_STATUS_FAILED');
  return res.json();
}
