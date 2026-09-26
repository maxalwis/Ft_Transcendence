import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import FriendsList from './FriendsList';
import FriendsRequests from './FriendRequests';
import FriendsSearchBar from './FriendsSearchBar';
import FriendsSearchResults from './FriendsSearchResults';
import type { User, PendingRequest } from '../../../api/friends';
import ViewProfile from '../../profile/components/ViewProfile';
import Button from '../../../components/ui/Button';

interface FriendsContentProps {
  friends: User[];
  requests: PendingRequest[];
  onDataChanged: () => void;
  onRemoveFriend: (friendId: number) => Promise<void>;
  isLoggedIn: boolean;
  onBack?: () => void;
}

export default function FriendsContent({
  friends,
  requests,
  onDataChanged,
  onRemoveFriend,
  isLoggedIn,
  onBack,
}: FriendsContentProps) {
  const { t } = useTranslation();

  const [input, setInput] = useState('');
  const [showRequests, setShowRequests] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState<User | null>(null);

  const handleBack = () => {
    setInput('');

    if (showRequests) {
      setShowRequests(false);
      return;
    }

    onBack?.();
  };

  if (!isLoggedIn) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-4 text-center">
        <p className="text-sm font-medium">{t('friendsModal.notLoggedIn')}</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className={`min-h-0 flex-1 overflow-y-auto pt-2 pb-2`}>
        {showRequests ? (
          <FriendsRequests requests={requests} onDataChanged={onDataChanged} onBack={handleBack} />
        ) : input.trim() ? (
          <FriendsSearchResults
            input={input}
            friends={friends}
            onDataChanged={onDataChanged}
            onSelectFriend={setSelectedFriend}
          />
        ) : (
          <FriendsList friends={friends} onSelectFriend={setSelectedFriend} />
        )}
      </div>

      {!showRequests && (
        <div className="shrink-0">
          {requests.length > 0 && (
            <Button
              variant="ghost"
              type="button"
              onClick={() => setShowRequests(true)}
              className="w-full bg-transparent! border-hidden! py-3!"
            >
              {t('friendsModal.pendingRequests', {
                count: requests.length,
              })}
            </Button>
          )}

          <div className="glass-panel shrink-0">
            <FriendsSearchBar input={input} setInput={setInput} />
          </div>
        </div>
      )}

      {selectedFriend && (
        <ViewProfile
          friend={selectedFriend}
          onClose={() => setSelectedFriend(null)}
          onRemove={onRemoveFriend}
        />
      )}
    </div>
  );
}
