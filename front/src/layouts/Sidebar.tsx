import { useState, useEffect } from 'react';
import Chat from '../features/chat/components/Chat';
import Event from '../features/events/components/Event';
import type { EventItem } from '../types/event';
import { useTranslation } from 'react-i18next';

interface SideBarProps {
  onClose: () => void;
  eventId?: string;
  currentUserId?: number;
  events?: EventItem[];
  event?: EventItem | null;
}

export default function SideBar({ onClose, eventId, currentUserId, events = [], event }: SideBarProps) {
  const { t } = useTranslation();
  const [eventDetails, setEventDetails] = useState<EventItem | null>(event || null);

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
  }, [eventId, events, event]);

  return (
    <div className="glass-panel fixed top-2 right-3 w-[20vw] h-[96.5vh] rounded-xl p-5 shadow-lg z-1000 flex flex-col">
      <div>
        <button
          className="glass-panel hover:bg-red-500/25 hover:border-red-500/50 w-6 h-6 rounded-full cursor-pointer shadow-md shadow-red-500/10 absolute right-3 flex items-center justify-center text-gray-300 hover:text-red-400 transition-all"
          onClick={onClose}
          aria-label="Close"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-3.5 h-3.5"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <div className="h-[30%] overflow-hidden border-b border-teal-200/20 pb-2 flex flex-col gap-2">
        {eventDetails ? (
          <Event event={eventDetails} />
        ) : (
          <div className="text-gray-400 text-sm flex items-center justify-center h-full">
            {t('sidebar.selectEvent', 'Select an event.')}
          </div>
        )}
      </div>

      <div className="h-[70%] flex flex-col overflow-hidden pt-2">
        <div className="flex gap-2 mb-2 border-b border-teal-200/20 pb-1">
          <span className="text-sm font-bold pb-1 text-teal-400 border-b-2 border-teal-400">
            {t('chat.title', 'Chat')}
          </span>
        </div>

        <div className="flex-1 overflow-hidden">
          {eventId && currentUserId ? (
            <Chat eventId={eventId} currentUserId={currentUserId} />
          ) : (
            <div className="text-gray-400 text-sm p-4 flex items-center justify-center">
              {t('chat.connectPrompt', 'Connect to view chat.')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}