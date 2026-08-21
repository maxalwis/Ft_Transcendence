<<<<<<< HEAD
import { useState } from "react";
import Chat from "./Chat/Chat";
import Friends from "./Friends/Friends";

interface ChatWindowProps {
    onClose: () => void;
}

export default function MySidebar({ onClose } : ChatWindowProps)
{
    const [activeTab, setActiveTab] = useState<'chat' | 'friends'>('chat');

    return (
        <div className="fixed top-2 right-3 w-[20vw] h-[96.5vh] bg-teal-50 rounded-xl p-5 shadow-lg z-1000 flex flex-col">
            <div>
                <button
                    className="hover:bg-red-400 w-6 h-6 rounded-full font-bold font-stretch-150% 
                    cursor-pointer shadow-md shadow-red-400 absolute right-3 flex items-center justify-center"
                    onClick={onClose}>
                     x
                </button>
            </div>
            
            {/* Section Événements (30%) */}
            <div className="h-[30%] overflow-hidden border-b border-teal-200 pb-2">
                Event
            </div>

            {/* Section Chat / Amis (70%) avec onglets */}
            <div className="h-[70%] flex flex-col overflow-hidden pt-2">
                <div className="flex gap-2 mb-2 border-b border-teal-200 pb-1">
                    <button
                        onClick={() => setActiveTab('chat')}
                        className={`text-sm font-bold pb-1 cursor-pointer transition-colors ${
                            activeTab === 'chat'
                                ? 'text-teal-700 border-b-2 border-teal-600'
                                : 'text-slate-400 hover:text-slate-600'
                        }`}
                    >
                        Chat
                    </button>
                    <button
                        onClick={() => setActiveTab('friends')}
                        className={`text-sm font-bold pb-1 cursor-pointer transition-colors ${
                            activeTab === 'friends'
                                ? 'text-teal-700 border-b-2 border-teal-600'
                                : 'text-slate-400 hover:text-slate-600'
                        }`}
                    >
                        Amis
                    </button>
                </div>

                <div className="flex-1 overflow-hidden">
                    {activeTab === 'chat' ? <Chat /> : <Friends />}
                </div>
            </div>
        </div>
    );
}
=======
import Chat from './Chat/Chat';

interface MySidebarProps {
  onClose: () => void;
  eventId: string;
  currentUserId: number;
}

export default function MySidebar({ onClose, eventId, currentUserId }: MySidebarProps) {
  return (
    <div className="glassmorphism-popup fixed top-2 right-3 w-[20vw] h-[96.5vh] rounded-xl p-5 shadow-lg z-1000 flex flex-col">
      <div>
        <button
          className="glassmorphism-element hover:bg-red-500/20 hover:border-red-500/50 w-6 h-6 rounded-full cursor-pointer shadow-md shadow-red-500/10 absolute right-3 flex items-center justify-center text-gray-300 hover:text-red-400 transition-all"
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
      <div className="h-[30%] overflow-hidden">Event Details</div>
      <div className="h-[70%] flex flex-col overflow-hidden">
        {eventId ? (
          <Chat eventId={eventId} currentUserId={currentUserId} />
        ) : (
          <div className="text-gray-400 text-sm p-4">Select an event to view chat.</div>
        )}
      </div>
    </div>
  );
}
>>>>>>> dev
