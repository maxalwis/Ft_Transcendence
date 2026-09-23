import { useTranslation } from 'react-i18next';
import type { User } from '../../../api/friends';
import Button from '../../../components/ui/Button';

type FriendsListProps = {
  friends: User[];
  onSelectFriend: (friend: User) => void;
};

export default function FriendsList({ friends = [], onSelectFriend }: FriendsListProps) {
  const { t } = useTranslation();

  if (friends.length === 0) {
    return (
      <div className="flex items-center justify-center px-4 py-6">
        <p className="text-xs italic text-slate-400">
          {t('friendsList.noFriends', 'No friends yet.')}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-2">
        {friends.map((friend) => (
          <Button
            variant="ghost"
            key={friend.id}
            type="button"
            onClick={() => onSelectFriend(friend)}
            className="menuButton flex"
          >
            <div className="relative shrink-0">
              <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-slate-600 text-xs font-semibold text-white">
                {friend.avatar ? (
                  <img src={friend.avatar} alt="" className="h-full w-full object-cover" />
                ) : (
                  friend.username?.charAt(0).toUpperCase() || '?'
                )}
              </div>

              <div
                className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full ${
                  friend.status === 'ONLINE' ? 'bg-green-500' : 'bg-gray-400'
                }`}
              />
            </div>

            <span className="min-w-0 flex-1 truncate">{friend.username || 'Inconnu'}</span>
          </Button>
        ))}
      </div>
    </>
  );
}
