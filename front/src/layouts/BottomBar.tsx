import LoginButton from '../features/auth/components/Auth';
import Friends from '../features/friends/components/Friends';

interface BottomBarProps {
  onOpenAuth: () => void;
}

export default function BottomBar({ onOpenAuth }: BottomBarProps) {
  return (
    <div
      dir="ltr"
      className="fixed bottom-2 w-full flex flex-row items-center justify-between px-6 z-500 pointer-events-none"
    >
      {/* Left side position */}
      <div className="pointer-events-auto">
        <Friends />
      </div>

      {/* Centered actions */}
      <div
        dir="ltr"
        className="flex items-center absolute bottom-0 left-1/2 -translate-x-1/2 gap-2 pointer-events-auto"
      >
        <LoginButton onOpenAuth={onOpenAuth} />

        <button type="button" className="glass-panel" aria-label="Notifications">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
            <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
          </svg>
        </button>
      </div>
    </div>
  );
}
