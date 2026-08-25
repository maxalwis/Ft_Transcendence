import { useState } from 'react';
import type { PendingRequest } from '../../../api/friends';
import { acceptFriendRequest } from '../../../api/friends';
import { useAuth } from '../../../context/auth/AuthContext';

type FriendsRequestsProps = {
  requests: PendingRequest[];
  onDataChanged: () => void;
};

export default function FriendsRequests({ requests, onDataChanged }: FriendsRequestsProps) {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { accessToken } = useAuth();

  const handleAccept = async (senderId: number) => {
    try {
      await acceptFriendRequest(senderId, accessToken!);
      onDataChanged();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Erreur lors de l'acceptation");
    }
  };

  if (!requests || requests.length === 0) {
    return (
      <div className="p-3 text-xs text-slate-400 italic text-center">
        Aucune demande d'ami en attente.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 p-2">
      {errorMsg && <p className="text-xs text-red-500">{errorMsg}</p>}
      {requests.map((req: any) => {
        // Extraction sécurisée du nom du demandeur (sender)
        const displayName =
          req.sender?.username || `Utilisateur #${req.senderId || req.id}`;
        const targetId = req.senderId || req.sender?.id || req.id;

        return (
          <div
            key={req.id}
            className="flex items-center justify-between gap-2 rounded-lg bg-white/10 px-3 py-2 text-sm text-black"
          >
            <span className="font-medium">{displayName}</span>
            <button
              type="button"
              onClick={() => handleAccept(targetId)}
              className="px-2 py-1 text-xs bg-green-600 text-white rounded-md hover:bg-green-700 cursor-pointer"
            >
              Accept
            </button>
          </div>
        );
      })}
    </div>
  );
}
