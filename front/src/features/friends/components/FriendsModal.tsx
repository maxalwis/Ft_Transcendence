import type { OpenState } from './Friends';
import type { User, PendingRequest } from '../../../api/friends';
import FriendsContent from './FriendsContent';
import styles from '../Friends.module.css';
import { closeBtn } from '../../../types/icons';

type FriendsModalProps = OpenState & {
  friends: User[];
  requests: PendingRequest[];
  onDataChanged: () => void;
  onRemoveFriend: (friendId: number) => Promise<void>;
  isLoggedIn: boolean;
};

export default function FriendsModal({
  isOpen,
  setIsOpen,
  friends,
  requests,
  onDataChanged,
  onRemoveFriend,
  isLoggedIn,
}: FriendsModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className={`glass-panel absolute bottom-0 left-0 flex flex-col overflow-hidden rounded-xl ${styles.friendsModal}`}
    >
      <div className="relative flex h-10 shrink-0 items-center">
        <button
          type="button"
          aria-label="Close"
          className="modal-button modal-close"
          onClick={() => setIsOpen(false)}
        >
          {closeBtn}
        </button>
      </div>

      <FriendsContent
        friends={friends}
        requests={requests}
        onDataChanged={onDataChanged}
        onRemoveFriend={onRemoveFriend}
        isLoggedIn={isLoggedIn}
      />
    </div>
  );
}
