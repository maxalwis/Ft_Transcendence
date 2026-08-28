import Chat from '../features/chat/components/Chat';
import Event from '../features/events/components/Event';
import type { EventItem } from '../types/event';

interface SideBarProps {
  onClose: () => void;
  eventId?: string;
  currentUserId?: number;
  event?: EventItem | null;
}

export default function SideBar({ onClose, eventId, currentUserId, event }: SideBarProps) {
  return (
    <div className="glass-panel fixed top-2 right-3 w-[20vw] h-[96.5vh] rounded-xl p-5 shadow-lg z-1000 flex flex-col">
      <div>
        {/* Bouton fermer */}
        <button
          className="glass-panel hover:bg-red-500/20 hover:border-red-500/50 w-6 h-6 rounded-full cursor-pointer shadow-md shadow-red-500/10 absolute right-3 flex items-center justify-center text-gray-300 hover:text-red-400 transition-all"
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
      <div className="h-[30%] overflow-hidden border-b border-teal-200/20 pb-2">
        {event ? (
          <Event event={event} />
        ) : (
          <div className="p-2 text-sm text-slate-400">Select an event.</div>
        )}
      </div>

      {/* Section Chat (70%) */}
      <div className="h-[70%] flex flex-col overflow-hidden pt-2">
        <div className="flex-1 overflow-hidden">
          {eventId && currentUserId ? (
            <Chat eventId={eventId} currentUserId={currentUserId} />
          ) : (
            <div className="text-gray-400 text-sm p-4 flex items-center justify-center">
              Connect to view chat.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
