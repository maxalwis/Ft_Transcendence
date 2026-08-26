export default function AddFriends(
  friendName: string,
  setFriends: React.Dispatch<React.SetStateAction<string[]>>
) {
  setFriends((currentFriends) => [...currentFriends, friendName]);
}

// export default async function AddFriend(userId: number) {
// 	const response = await fetch('/api/friends', {
// 		method: 'POST',
// 		headers: {
// 			'Content-Type': 'application/json'
// 		},
// 		body: JSON.stringify({
// 			userId: userId
// 		})
// 	});

// 	if (!response.ok) {
// 		throw new Error('Erreur lors de l\'ajout de l\'ami');
// 	}
// }
