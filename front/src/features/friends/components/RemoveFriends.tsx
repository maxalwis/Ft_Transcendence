export default function RemoveFriends(
  friendName: string,
  setFriends: React.Dispatch<React.SetStateAction<string[]>>
) {
  setFriends((currentFriends) => currentFriends.filter((friend) => friend !== friendName));
}

// export default async function RemoveFriend(userId: number) {
// 	const response = await fetch(`/api/friends/${userId}`, {
// 		method: 'DELETE'
// 	});

// 	if (!response.ok) {
// 		throw new Error('Erreur lors de la suppression de l\'ami');
// 	}
// }
