import { useEffect, useState } from 'react';

import Chat from '../../chat/components/Chat';
import Event from './Event';

import type { EventItem } from '../../../types/event';

import { useTranslation } from 'react-i18next';
import Button from '../../../components/ui/Button';

interface EventSidebarContentProps {
  eventId: string;
  currentUserId?: string | number;
}

export default function EventSidebarContent({ eventId, currentUserId }: EventSidebarContentProps) {
  const [fetchedEvent, setFetchedEvent] = useState<EventItem | null>(null);
  const [mobileView, setMobileView] = useState<'chat' | 'event'>('event');

  const { t } = useTranslation();

  useEffect(() => {
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
      {/* Mobile category switch */}
      <div className="min-[901px]:hidden shrink-0 flex gap-2 mb-2 border-b border-teal-200/20 pb-1">
        <Button
          variant="ghost"
          type="button"
          onClick={() => setMobileView('event')}
          className={`flex-1 ${mobileView === 'event' ? 'isSelected' : ''}`}
        >
          {t('sidebar.event', 'Event')}
        </Button>
        <Button
          variant="ghost"
          type="button"
          onClick={() => setMobileView('chat')}
          className={`flex-1 ${mobileView === 'chat' ? 'isSelected' : ''}`}
        >
          {t('chat.title', 'Chat')}
        </Button>
      </div>
      {/* Event Details */}
      <div
        className={`
          shrink-0 overflow-y-auto border-b border-teal-200/20 pb-2 flex flex-col gap-2
          max-[900px]:flex-1 max-[900px]:min-h-0
          ${mobileView === 'chat' ? 'max-[900px]:hidden' : ''}
          min-[901px]:max-h-[50%]
        `}
      >
        {fetchedEvent ? (
          <Event event={fetchedEvent} />
        ) : (
          <div className="text-gray-400 text-sm flex items-center justify-center p-4">
            {t('sidebar.selectEvent', 'Select an event.')}
          </div>
        )}
      </div>
      {/* Chat */}
      <div
        className={`
          flex-1 min-h-0 flex-col pt-2
          max-[900px]:flex
          ${mobileView === 'event' ? 'max-[900px]:hidden' : ''}
          min-[901px]:flex
        `}
      >
        {/* Desktop chat title */}
        <div className="shrink-0 flex gap-2 mb-2 border-b border-teal-200/20 pb-1 min-[901px]:flex max-[900px]:hidden">
          <span className="text-sm font-bold pb-1 text-teal-400 border-b-2 border-teal-400">
            {t('chat.title', 'Chat')}
          </span>
        </div>

        <div dir="ltr" className="flex-1 min-h-0 overflow-hidden flex flex-col">
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
