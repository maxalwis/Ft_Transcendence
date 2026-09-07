import LoginButton from '../features/auth/components/Auth';
import Friends from '../features/friends/components/Friends';

interface BottomBarProps {
  onOpenAuth: () => void;
}

export default function BottomBar({ onOpenAuth }: BottomBarProps) {
  return (
    <div className="fixed bottom-2 w-full flex flex-row items-center justify-between px-3 z-500 pointer-events-none">
      {/* Left side position */}
      <div className="pointer-events-auto">
        <Friends />
      </div>

      {/* Centered actions */}
      <div className="flex items-center absolute bottom-0 left-1/2 -translate-x-1/2 gap-2 pointer-events-auto">
        <LoginButton onOpenAuth={onOpenAuth} />
      </div>
    </div>
  );
}
