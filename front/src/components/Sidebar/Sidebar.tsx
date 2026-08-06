import Chat from './Chat/Chat';

interface ChatWindowProps {
  onClose: () => void;
}

export default function MySidebar({ onClose }: ChatWindowProps) {
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
      <div className="h-[30%] overflow-hidden">Event</div>
      <div className="h-[70%] flex flex-col overflow-hidden">
        <Chat></Chat>
      </div>
    </div>
  );
}
