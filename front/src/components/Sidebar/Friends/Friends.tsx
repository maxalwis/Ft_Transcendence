import { useEffect, useState } from 'react';
import { getFriends, getPendingRequests, sendFriendRequest, acceptFriendRequest } from '../../../api/friends.js';

interface User {
  id: number;
  username: string;
  avatar?: string;
  status: 'ONLINE' | 'OFFLINE' | 'IN_GAME';
}

interface PendingRequest {
  senderId?: number;
  receiverId?: number;
  sender: User;
  createdAt?: string;
}

export default function Friends() {
  const [friends, setFriends] = useState<User[]>([]);
  const [pending, setPending] = useState<PendingRequest[]>([]);
  const [targetId, setTargetId] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [friendsList, pendingList] = await Promise.all([
        getFriends(),
        getPendingRequests(),
      ]);
      setFriends(friendsList || []);
      setPending(pendingList || []);
    } catch (err) {
      console.error('Erreur de chargement :', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddFriend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetId) return;
    setErrorMsg(null);

    try {
      await sendFriendRequest(Number(targetId));
      setTargetId('');
      alert('Demande envoyée !');
      loadData();
    } catch (err: any) {
      setErrorMsg(err.message || "Erreur lors de l'envoi de la demande");
    }
  };

  const handleAccept = async (senderId: number) => {
    try {
      await acceptFriendRequest(senderId);
      loadData();
    } catch (err) {
      console.error("Erreur lors de l'acceptation :", err);
    }
  };

  return (
    <div className="flex flex-col h-full gap-3 pt-2">
      {/* Formulaire d'ajout */}
      <form onSubmit={handleAddFriend} className="flex gap-2">
        <input
          type="number"
          placeholder="ID utilisateur"
          value={targetId}
          onChange={(e) => setTargetId(e.target.value)}
          className="w-full px-2 py-1 text-sm border rounded-lg bg-white outline-none focus:ring-1 focus:ring-teal-500 text-slate-800"
        />
        <button
          type="submit"
          className="px-3 py-1 bg-teal-600 text-white rounded-lg text-sm font-bold hover:bg-teal-700 cursor-pointer"
        >
          +
        </button>
      </form>

      {/* Affichage des erreurs éventuelles */}
      {errorMsg && (
        <p className="text-xs text-red-500 font-medium px-1">{errorMsg}</p>
      )}

      {/* Demandes en attente */}
      {pending.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            En attente ({pending.length})
          </p>
          {pending.map((req) => (
            <div
              key={req.sender.id}
              className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-200"
            >
              <span className="text-sm font-medium text-slate-700">
                {req.sender.username}
              </span>
              <button
                onClick={() => handleAccept(req.sender.id)}
                className="px-2 py-0.5 text-xs bg-green-600 text-white rounded font-medium hover:bg-green-700 transition-colors cursor-pointer"
              >
                Accepter
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Liste des amis */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Amis ({friends.length})
        </p>
        {friends.length === 0 ? (
          <p className="text-xs text-slate-400 italic">Aucun ami pour le moment.</p>
        ) : (
          friends.map((friend) => (
            <div
              key={friend.id}
              className="flex items-center justify-between p-2 bg-white rounded-lg shadow-sm"
            >
              <span className="text-sm font-medium text-slate-700">{friend.username}</span>
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  friend.status === 'ONLINE'
                    ? 'bg-green-500'
                    : friend.status === 'IN_GAME'
                    ? 'bg-blue-500'
                    : 'bg-gray-300'
                }`}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}