import { useState, useEffect, useRef } from 'react';
import Chat from '../features/chat/components/Chat';
import Event from '../features/events/components/Event';
import type { EventItem } from '../types/event';
import { useTranslation } from 'react-i18next';
import styles from '../features/map/Map.module.css';
import LanguageSelector from './LanguageSelector';

interface SideBarProps {
  onClose: () => void;
  eventId?: string;
  currentUserId?: string | number;
  events?: EventItem[];
  event?: EventItem | null;
}

const EMPTY_EVENT: EventItem[] = [];

export default function SideBar({
  onClose,
  eventId,
  currentUserId,
  events = EMPTY_EVENT,
  event,
}: SideBarProps) {
  const [fetchedEvent, setFetchedEvent] = useState<EventItem | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);

  // Find in list synchronously or use passed event prop
  const eventFromProps = event ?? events.find((ev) => ev.id === eventId) ?? null;

  // Prefer event passed via props, fallback to manually fetched event
  const eventDetails = eventFromProps || fetchedEvent;
  const [isOpen, setIsOpen] = useState(true);
  const [mobileView, setMobileView] = useState<'chat' | 'event'>('event');
  const { t } = useTranslation();

  const handleAnimationEnd = () => {
    if (!isOpen) onClose();
  };

  useEffect(() => {
    // Skip fetching if event is already provided or no eventId exists
    if (eventFromProps || !eventId) {
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
  }, [eventId, eventFromProps]);

  return (
    <div
      ref={rootRef}
      data-state={isOpen ? 'open' : 'closed'}
      onAnimationEnd={handleAnimationEnd}
      className={`glass-panel ${styles.sidebarModal} fixed top-15 right-3 bottom-15 w-[20vw] rounded-xl p-5 shadow-lg flex flex-col`}
    >
      <LanguageSelector embedded />

      {/* Close Button Header */}
      <div className="shrink-0">
        <button
          type="button"
          aria-label="Close"
          onClick={() => setIsOpen(false)}
          className="modal-close"
        >
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Mobile category switch */}
      <div className="min-[901px]:hidden shrink-0 flex gap-2 mb-2 border-b border-teal-200/20 pb-1">
        <button
          type="button"
          onClick={() => setMobileView('event')}
          className={`flex-1 ${
            mobileView === 'event' ? 'text-teal-400 border-b-2 border-teal-400' : 'text-gray-400'
          }`}
        >
          {t('sidebar.event', 'Event')}
        </button>

        <button
          type="button"
          onClick={() => setMobileView('chat')}
          className={`flex-1 ${
            mobileView === 'chat' ? 'text-teal-400 border-b-2 border-teal-400' : 'text-gray-400'
          }`}
        >
          {t('chat.title', 'Chat')}
        </button>
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
        {eventDetails ? (
          <Event event={eventDetails} />
        ) : (
          <div className="text-gray-400 text-sm flex items-center justify-center p-4">
            {t('sidebar.selectEvent', 'Select an event.')}
          </div>
        )}
      </div>

      {/* Chat Section */}
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
    </div>
  );
}
