import type { OpenState, FriendAction } from './Friends';
import type { User, PendingRequest } from '../../../api/friends';
import FriendsContent from './FriendsContent';
import styles from '../Friends.module.css';

type FriendsModalProps = OpenState & {
  action: FriendAction;
  setAction: React.Dispatch<React.SetStateAction<FriendAction>>;
  friends: User[];
  requests: PendingRequest[];
  onDataChanged: () => void;
  isLoggedIn: boolean;
};

export default function FriendsModal({
  action,
  setAction,
  isOpen,
  setIsOpen,
  friends,
  requests,
  onDataChanged,
  isLoggedIn,
}: FriendsModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className={`glass-panel absolute bottom-0 left-0 flex flex-col rounded-xl overflow-hidden ${styles.friendsModal}`}
    >
      <button
        type="button"
        aria-label="Close"
        className="modal-close"
        onClick={() => setIsOpen(false)}
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

      <FriendsContent
        action={action}
        setAction={setAction}
        friends={friends}
        requests={requests}
        onDataChanged={onDataChanged}
        isLoggedIn={isLoggedIn}
      />
    </div>
  );
}
