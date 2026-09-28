import type { PrismaService } from '../prisma/prisma.service';

// Ids des amis acceptés d'un utilisateur. Fonction libre (et pas méthode de FriendsService)
// pour être utilisable par le gateway realtime sans dépendance circulaire
// (FriendsModule importe déjà RealtimeModule).
export async function findFriendIds(prisma: PrismaService, userId: number): Promise<number[]> {
  const friendships = await prisma.friendship.findMany({
    where: {
      OR: [
        { senderId: userId, status: 'ACCEPTED' },
        { receiverId: userId, status: 'ACCEPTED' },
      ],
    },
    select: { senderId: true, receiverId: true },
  });

  return friendships.map((f) => (f.senderId === userId ? f.receiverId : f.senderId));
}
