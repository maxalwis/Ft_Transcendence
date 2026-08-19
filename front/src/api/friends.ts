const API_URL = 'http://127.0.0.1:3000/friends';

export async function sendFriendRequest(receiverId: number) {
  const res = await fetch(`${API_URL}/request/${receiverId}`, {
    method: 'POST',
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Erreur lors de l'envoi");
  }
  return res.json();
}

export async function acceptFriendRequest(senderId: number) {
  const res = await fetch(`${API_URL}/accept/${senderId}`, {
    method: 'PATCH',
  });
  if (!res.ok) throw new Error("Impossible d'accepter la demande");
  return res.json();
}

export async function getFriends() {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error("Erreur de récupération des amis");
  return res.json();
}


export async function getPendingRequests() {
  const res = await fetch('http://localhost:3000/friends/pending', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },

  });
  if (!res.ok) throw new Error('Erreur lors de la récupération des demandes');
  return res.json();
}