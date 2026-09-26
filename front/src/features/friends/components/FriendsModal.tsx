import type { OpenState } from './Friends';
import type { User, PendingRequest } from '../../../api/friends';
import FriendsContent from './FriendsContent';
import styles from '../Friends.module.css';
import ModalLayout from '../../../components/ui/ModalLayout';

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
    <ModalLayout
      variant="popover"
      onClose={() => setIsOpen(false)}
      className={`absolute bottom-0 left-0 ${styles.friendsModal}`}
    >
      <FriendsContent
        friends={friends}
        requests={requests}
        onDataChanged={onDataChanged}
        onRemoveFriend={onRemoveFriend}
        isLoggedIn={isLoggedIn}
      />
    </ModalLayout>
  );
}
