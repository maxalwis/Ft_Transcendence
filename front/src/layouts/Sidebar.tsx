import { useState, useEffect } from 'react';
import Chat from '../features/chat/components/Chat';
import Event from '../features/events/components/Event';
import type { EventItem } from '../types/event';
import { useTranslation } from 'react-i18next';
import { FlagFR, FlagGB, FlagES } from './FlagIcons';

interface SideBarProps {
  onClose: () => void;
  eventId?: string;
  currentUserId?: number;
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
  const [eventDetails, setEventDetails] = useState<EventItem | null>(event || null);
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;

  useEffect(() => {
    if (event !== undefined) {
      setEventDetails(event);
      return;
    }

    if (!eventId) {
      setEventDetails(null);
      return;
    }

    const foundInList = events.find((ev) => ev.id === eventId);
    if (foundInList) {
      setEventDetails(foundInList);
      return;
    }

    const baseUrl = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000';
    fetch(`${baseUrl}/events/${eventId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setEventDetails(data))
      .catch(() => setEventDetails(null));
  }, [eventId]);

  return (
    <div className="glass-panel fixed top-2 right-3 bottom-2 w-[20vw] rounded-xl p-5 shadow-lg z-1000 flex flex-col">
      <div className="pointer-events-auto absolute top-3 right-full mr-2 flex flex-col gap-2">
        <button
          type="button"
          onClick={() => i18n.changeLanguage('fr')}
          title="Français"
          className={`glass-panel cursor-pointer px-3 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5 ${
            currentLang?.startsWith('fr') ? 'isSelected' : ''
          }`}
        >
          <FlagFR className="w-5 h-5 rounded-sm object-cover shrink-0" />
        </button>

        <button
          type="button"
          onClick={() => i18n.changeLanguage('en')}
          title="English"
          className={`glass-panel cursor-pointer px-3 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5 ${
            currentLang?.startsWith('en') ? 'isSelected' : ''
          }`}
        >
          <FlagGB className="w-5 h-5 rounded-sm object-cover shrink-0" />
        </button>

        <button
          type="button"
          onClick={() => i18n.changeLanguage('es')}
          title="Español"
          className={`glass-panel cursor-pointer px-3 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5 ${
            currentLang?.startsWith('es') ? 'isSelected' : ''
          }`}
        >
          <FlagES className="w-5 h-5 rounded-sm object-cover shrink-0" />
        </button>
      </div>

      {/* Close Button Header */}
      <div className="shrink-0">
        <button type="button" aria-label="Close" onClick={onClose} className="modal-close">
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

      {/* Event Details Section (takes natural size) */}
      <div className="shrink-0 border-b border-teal-200/20 pb-2 flex flex-col gap-2">
        {eventDetails ? (
          <Event event={eventDetails} />
        ) : (
          <div className="text-gray-400 text-sm flex items-center justify-center p-4">
            {t('sidebar.selectEvent', 'Select an event.')}
          </div>
        )}
      </div>

      {/* Chat Section (takes all remaining height) */}
      <div className="flex-1 min-h-0 flex flex-col pt-2">
        <div className="shrink-0 flex gap-2 mb-2 border-b border-teal-200/20 pb-1">
          <span className="text-sm font-bold pb-1 text-teal-400 border-b-2 border-teal-400">
            {t('chat.title', 'Chat')}
          </span>
        </div>

        <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
          {eventId && currentUserId ? (
            <Chat eventId={eventId} currentUserId={currentUserId} />
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
