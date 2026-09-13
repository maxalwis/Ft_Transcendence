import { useEffect, useState } from 'react';

import Chat from '../../chat/components/Chat';
import Event from './Event';

import type { EventItem } from '../../../types/event';

import { useTranslation } from 'react-i18next';

interface EventSidebarContentProps {
  eventId?: string;
  currentUserId?: string | number;
}

export default function EventSidebarContent({ eventId, currentUserId }: EventSidebarContentProps) {
  const [fetchedEvent, setFetchedEvent] = useState<EventItem | null>(null);

  const { t } = useTranslation();

  useEffect(() => {
    if (!eventId) {
      setFetchedEvent(null);
      return;
    }

    let isMounted = true;

    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

    fetch(`${baseUrl}/events/${eventId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data: EventItem | null) => {
        if (isMounted) {
          setFetchedEvent(data);
        }
      })
      .catch(() => {
        if (isMounted) {
          setFetchedEvent(null);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [eventId]);

  return (
    <>
      {/* Event Details Section */}
      <div className="shrink-0 max-h-[50%] overflow-y-auto border-b border-teal-200/20 pb-2 flex flex-col gap-2">
        {fetchedEvent ? (
          <Event event={fetchedEvent} />
        ) : (
          <div className="text-gray-400 text-sm flex items-center justify-center p-4">
            {t('sidebar.selectEvent', 'Select an event.')}
          </div>
        )}
      </div>

      {/* Chat Section */}
      <div className="flex-1 min-h-0 flex flex-col pt-2">
        <div className="shrink-0 flex gap-2 mb-2 border-b border-teal-200/20 pb-1">
          <span className="text-sm font-bold pb-1 text-teal-400 border-b-2 border-teal-400">
            {t('chat.title', 'Chat')}
          </span>
        </div>

        <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
          {eventId && currentUserId ? (
            <Chat eventId={eventId} currentUserId={Number(currentUserId)} />
          ) : (
            <div className="text-gray-400 text-sm p-4 flex items-center justify-center h-full">
              {t('chat.connectPrompt', 'Connect to view chat.')}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
