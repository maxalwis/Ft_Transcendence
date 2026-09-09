// prisma/seed.ts
//
// Installation :
//   npm install -D @faker-js/faker ts-node
//   (bcrypt est déjà une dépendance de prod, pas besoin de la réinstaller)
//
// package.json :
//   "prisma": { "seed": "ts-node prisma/seed.ts" }
//
// Lancement :
//   npx prisma db seed
//
// Prérequis : les events doivent déjà être en base (récupérés via votre pipeline API)

import { faker } from '@faker-js/faker';
import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';
import * as http from 'http';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

// ---- Logstash HTTP Logger Helper ------------------------------------------

function sendSeedLog(data: {
  message: string;
  action: string;
  userId?: number;
  eventId?: string;
  status?: string;
}) {
  const payload = JSON.stringify({
    '@timestamp': new Date().toISOString(),
    service: 'nestjs-backend-seed',
    level: 'info',
    message: data.message,
    action: data.action,
    userId: data.userId,
    eventId: data.eventId,
    system_health_status: data.status || 'OK',
    response_time_ms: faker.number.int({ min: 12, max: 180 }),
  });

  const req = http.request({
    hostname: process.env.LOGSTASH_HOST || 'logstash',
    port: 5044,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload),
    },
  });

  req.on('error', () => {}); // Silently ignore if Logstash is unreachable
  req.write(payload);
  req.end();
}

// ---- Flags pour activer/désactiver des étapes du seed ---------------------

const SEED_USERS = true;
const SEED_FRIENDSHIPS = true;
const SEED_INTERESTS = true;
const SEED_MESSAGES = true;

// ---- Paramètres -----------------------------------------------------------

const NUM_USERS = 150;
const POWER_USER_RATIO = 0.1;
const AVG_FRIEND_REQUESTS_PER_USER = 6;
const FAKE_PASSWORD = 'password123'; // hashé une seule fois, réutilisé pour tous

// ---- Utilitaires ------------------------------------------------------------

function randomSubset<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, arr.length));
}

function weightedBoolean(probability: number): boolean {
  return Math.random() < probability;
}

function safeBetween(from: Date, to: Date): Date {
  if (from.getTime() >= to.getTime()) {
    // Intervalle invalide ou nul : on retombe sur `from` directement
    return from;
  }
  return faker.date.between({ from, to });
}

async function main() {
  console.log('Cleaning up fake data (users/friendships/interests/messages)...');
  // On ne touche PAS aux events, ils viennent de l'API
  if (SEED_MESSAGES) await prisma.message.deleteMany();
  if (SEED_INTERESTS) await prisma.eventInterest.deleteMany();
  if (SEED_FRIENDSHIPS) await prisma.friendship.deleteMany();
  if (SEED_USERS) await prisma.user.deleteMany();

  // ---- 0. Events existants ----------------------------------------------
  console.log('Fetching existing events...');
  const existingEvents = await prisma.event.findMany();

  if (existingEvents.length === 0) {
    throw new Error(
      'No events found in the database. Run your API fetch pipeline first before seeding users.'
    );
  }

  // Tier de popularité "virtuel" pour piloter la génération d'intérêts/messages.
  // On utilise weight/rank s'ils sont déjà remplis par l'API, sinon on tire au hasard.
  const events = existingEvents.map((event) => {
    const popularityTier =
      event.weight != null
        ? event.weight >= 70
          ? 'hype'
          : event.weight >= 30
            ? 'normal'
            : 'discret'
        : weightedBoolean(0.15)
          ? 'hype'
          : weightedBoolean(0.4)
            ? 'normal'
            : 'discret';

    return { ...event, popularityTier };
  });

  // ---- 1. Users -----------------------------------------------------------
  let users: Array<Awaited<ReturnType<typeof prisma.user.create>> & { isPowerUser: boolean }> = [];

  if (SEED_USERS) {
    console.log('Creating users...');
    const hashedPassword = await bcrypt.hash(FAKE_PASSWORD, 10);

    for (let i = 0; i < NUM_USERS; i++) {
      const createdAt = faker.date.past({ years: 1 });
      const isPowerUser = weightedBoolean(POWER_USER_RATIO);
      const isChurned = !isPowerUser && weightedBoolean(0.3);
      const isOAuth = weightedBoolean(0.2); // simule un mix local / OAuth

      const user = await prisma.user.create({
        data: {
          username:
            faker.internet.username().toLowerCase() + faker.number.int({ min: 1, max: 999 }),
          email: faker.internet.email().toLowerCase(),
          password: isOAuth ? null : hashedPassword,
          provider: isOAuth ? faker.helpers.arrayElement(['google', 'github']) : null,
          providerId: isOAuth ? faker.string.uuid() : null,
          avatar: faker.image.avatarGitHub(),
          status: weightedBoolean(0.3) ? 'ONLINE' : 'OFFLINE',
          createdAt,
          updatedAt: isPowerUser
            ? faker.date.recent({ days: 3 })
            : isChurned
              ? faker.date.recent({ days: 60 })
              : faker.date.recent({ days: 14 }),
        },
      });

      users.push({ ...user, isPowerUser });

      // Emit log event
      sendSeedLog({
        message: `User created: ${user.username}`,
        action: 'user_registered',
        userId: user.id,
      });
    }
  } else {
    console.log('SEED_USERS disabled, fetching existing users...');
    const existingUsers = await prisma.user.findMany();
    users = existingUsers.map((u) => ({ ...u, isPowerUser: false }));
  }

  // ---- 2. Friendships (respecte la même règle que FriendsService : une seule
  //         paire par sens de relation, pas de doublon A-B / B-A) -------------
  const friendshipPairs = new Set<string>();
  const acceptedFriendMap = new Map<number, Set<number>>();

  if (SEED_FRIENDSHIPS) {
    console.log('Creating friendships...');

    for (const user of users) {
      const numRequests = faker.number.int({ min: 0, max: AVG_FRIEND_REQUESTS_PER_USER * 2 });
      const potentialFriends = randomSubset(
        users.filter((u) => u.id !== user.id),
        numRequests
      );

      for (const friend of potentialFriends) {
        const key = [user.id, friend.id].sort((a, b) => a - b).join('-');
        if (friendshipPairs.has(key)) continue;
        friendshipPairs.add(key);

        const status = weightedBoolean(0.75)
          ? 'ACCEPTED'
          : weightedBoolean(0.6)
            ? 'PENDING'
            : 'BLOCKED';

        await prisma.friendship.create({
          data: {
            senderId: user.id,
            receiverId: friend.id,
            status,
            createdAt: safeBetween(user.createdAt, new Date()),
          },
        });

        if (status === 'ACCEPTED') {
          if (!acceptedFriendMap.has(user.id)) acceptedFriendMap.set(user.id, new Set());
          if (!acceptedFriendMap.has(friend.id)) acceptedFriendMap.set(friend.id, new Set());
          acceptedFriendMap.get(user.id)!.add(friend.id);
          acceptedFriendMap.get(friend.id)!.add(user.id);
        }
      }
    }
  } else {
    console.log('SEED_FRIENDSHIPS disabled, fetching existing ACCEPTED friendships...');
    const existingFriendships = await prisma.friendship.findMany({ where: { status: 'ACCEPTED' } });
    for (const f of existingFriendships) {
      if (!acceptedFriendMap.has(f.senderId)) acceptedFriendMap.set(f.senderId, new Set());
      if (!acceptedFriendMap.has(f.receiverId)) acceptedFriendMap.set(f.receiverId, new Set());
      acceptedFriendMap.get(f.senderId)!.add(f.receiverId);
      acceptedFriendMap.get(f.receiverId)!.add(f.senderId);
    }
  }

  // ---- 3. EventInterest (funnel + effet social) --------------------------
  const interestSet = new Set<string>();

  if (SEED_INTERESTS) {
    console.log('Creating interests (with social effect)...');

    const baseProbability = (tier: string, isFree: boolean) => {
      let p = tier === 'hype' ? 0.35 : tier === 'normal' ? 0.15 : 0.05;
      if (!isFree) p *= 0.7;
      return p;
    };

    for (const event of events) {
      const isFree = event.priceType === 'gratuit';

      for (const user of users) {
        let p = baseProbability(event.popularityTier, isFree);
        if (user.isPowerUser) p *= 2;

        const friends = acceptedFriendMap.get(user.id) ?? new Set();
        const interestedFriendsCount = [...friends].filter((fid) =>
          interestSet.has(`${fid}-${event.id}`)
        ).length;
        p += interestedFriendsCount * 0.08;
        p = Math.min(p, 0.9);

        if (weightedBoolean(p)) {
          await prisma.eventInterest.create({
            data: {
              userId: user.id,
              eventId: event.id,
              createdAt: safeBetween(
                event.createdAt,
                event.dateStart < new Date() ? event.dateStart : new Date()
              ),
            },
          });
          interestSet.add(`${user.id}-${event.id}`);

          // Emit log event
          sendSeedLog({
            message: `User ${user.id} marked interest in event ${event.id}`,
            action: 'event_interest',
            userId: user.id,
            eventId: event.id,
          });
        }
      }
    }
  } else {
    console.log('SEED_INTERESTS disabled, fetching existing interests...');
    const existingInterests = await prisma.eventInterest.findMany();
    for (const i of existingInterests) {
      interestSet.add(`${i.userId}-${i.eventId}`);
    }
  }

  // ---- 4. Messages (corrélés à la popularité) ------------------------------
  if (SEED_MESSAGES) {
    console.log('Creating messages...');

    for (const event of events) {
      const interestedUserIds = [...interestSet]
        .filter((key) => key.endsWith(`-${event.id}`))
        .map((key) => parseInt(key.split('-')[0], 10));

      if (interestedUserIds.length === 0) continue;

      const chatActivityMultiplier =
        event.popularityTier === 'hype' ? 8 : event.popularityTier === 'normal' ? 3 : 0.5;

      const numMessages = Math.round(
        faker.number.int({ min: 0, max: 10 }) * chatActivityMultiplier
      );

      for (let i = 0; i < numMessages; i++) {
        const authorId = faker.helpers.arrayElement(interestedUserIds);
        await prisma.message.create({
          data: {
            userId: authorId,
            eventId: event.id,
            content: faker.lorem.sentence(),
            createdAt: safeBetween(event.createdAt, new Date()),
          },
        });

        // Emit log event
        sendSeedLog({
          message: `Message posted in event ${event.id}`,
          action: 'message_created',
          userId: authorId,
          eventId: event.id,
        });
      }
    }
  } else {
    console.log('SEED_MESSAGES disabled.');
  }

  console.log('Seed completed!');
  console.log(
    `   ${users.length} users (common password: "${FAKE_PASSWORD}" for non-OAuth accounts)`
  );
  console.log(`   ${events.length} events (existing, unmodified)`);
  console.log(`   ${friendshipPairs.size} friend requests created`);
  console.log(`   ${interestSet.size} total interests`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
