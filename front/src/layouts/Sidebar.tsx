import { useState, useEffect } from 'react';
import Chat from '../features/chat/components/Chat';
import type { EventItem } from '../types/event';

interface SideBarProps {
  onClose: () => void;
  eventId?: string;
  currentUserId?: number;
  events?: EventItem[];
}

export default function SideBar({ onClose, eventId, currentUserId, events = [] }: SideBarProps) {
  const [eventDetails, setEventDetails] = useState<EventItem | null>(null);

  // Cherche d'abord dans la liste globale filtrée, sinon fait un fetch
  useEffect(() => {
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
  }, [eventId, events]);

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

      {/* Section Événements (30%) */}
      <div className="h-[30%] overflow-hidden border-b border-teal-200/20 pb-2 flex flex-col gap-2">
        {eventDetails ? (
          <>
            <h3 className="text-sm font-bold text-slate-200 truncate">{eventDetails.title}</h3>
            {eventDetails.coverUrl && (
              <img src={eventDetails.coverUrl} alt={eventDetails.title} className="w-full h-16 object-cover rounded-md" />
            )}
            <div className="flex justify-between items-center text-xs text-slate-300">
              <span>Prix :</span>
              <span 
                className="font-bold text-teal-400 truncate max-w-[120px]" 
                dangerouslySetInnerHTML={{ 
                  __html: (eventDetails as any).priceDetail || (eventDetails as any).priceType || 'Gratuit' 
                }}
              />
            </div>
          </>
        ) : (
          <div className="text-gray-400 text-sm flex items-center justify-center h-full">
            Event Details
          </div>
        )}
      </div>

      {/* Section Chat (70%) */}
      <div className="h-[70%] flex flex-col overflow-hidden pt-2">
        <div className="flex gap-2 mb-2 border-b border-teal-200/20 pb-1">
          <span className="text-sm font-bold pb-1 text-teal-400 border-b-2 border-teal-400">
            Chat
          </span>
        </div>

        <div className="flex-1 overflow-hidden">
          {eventId && currentUserId ? (
            <Chat eventId={eventId} currentUserId={currentUserId} />
          ) : (
            <div className="text-gray-400 text-sm p-4">Select an event to view chat.</div>
          )}
        </div>
      </div>
    </div>
  );
}