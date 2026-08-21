import { useState } from 'react';
import type { PendingRequest } from '../../../api/friends';
import { acceptFriendRequest } from '../../../api/friends';

export type FriendsRequestsProps = {
  requests: PendingRequest[];
  onDataChanged: () => void;
};

export default function FriendsRequests({ requests, onDataChanged }: FriendsRequestsProps) {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const acceptRequest = async (senderId: number) => {
    setErrorMsg(null);
    try {
      await acceptFriendRequest(senderId);
      onDataChanged();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Erreur lors de l'acceptation.");
    }
  };

  const rejectRequest = (senderId: number) => {
    // TODO: appeler rejectFriendRequest(senderId) une fois l'endpoint ajouté côté backend
  };

  return (
    <div>
      {errorMsg && <p className="text-xs text-red-500 px-2 pb-1">{errorMsg}</p>}
      <ul className="mt-2 space-y-1">
        {requests.map((request) => (
          <li
            key={request.sender.id}
            className="flex items-center justify-between px-2 py-2 text-sm text-black"
          >
            <span>{request.sender.name}</span>

            <div className="flex gap-2 absolute right-11">
              <button
                className="cursor-pointer border border-green-500 hover:text-white hover:bg-green-600 rounded-lg p-1"
                onClick={() => acceptRequest(request.sender.id)}
              >
                Accept
              </button>
              <button
                className="cursor-pointer border border-red-500 hover:text-white hover:bg-red-600 rounded-lg p-1 bg"
                onClick={() => rejectRequest(request.sender.id)}
              >
                Reject
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
