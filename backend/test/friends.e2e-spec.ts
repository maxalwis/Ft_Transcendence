import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Friends concurrency (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  let userAId: number;
  let userBId: number;
  let tokenA: string;
  let tokenB: string;

  const agent = typeof request === 'function' ? request : (request as any).default;

  const timestamp = Date.now();

  const userA = {
    username: `e2e_friend_a_${timestamp}`,
    email: `e2e_friend_a_${timestamp}@test.local`,
    password: 'TestPassword123!',
  };

  const userB = {
    username: `e2e_friend_b_${timestamp}`,
    email: `e2e_friend_b_${timestamp}@test.local`,
    password: 'TestPassword123!',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prisma = app.get(PrismaService);

    const responseA = await agent(app.getHttpServer())
      .post('/auth/register')
      .send(userA)
      .expect(201);

    const responseB = await agent(app.getHttpServer())
      .post('/auth/register')
      .send(userB)
      .expect(201);

    tokenA = responseA.body.accessToken;
    tokenB = responseB.body.accessToken;

    userAId = responseA.body.user.id;
    userBId = responseB.body.user.id;
  }, 30000);

  it('handles simultaneous friend requests between two users', async () => {
    const [responseA, responseB] = await Promise.all([
      agent(app.getHttpServer())
        .post(`/friends/request/${userBId}`)
        .set('Authorization', `Bearer ${tokenA}`),

      agent(app.getHttpServer())
        .post(`/friends/request/${userAId}`)
        .set('Authorization', `Bearer ${tokenB}`),
    ]);

    const statuses = [responseA.status, responseB.status].sort();

    expect(statuses).toEqual([201, 409]);

    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [
          {
            senderId: userAId,
            receiverId: userBId,
          },
          {
            senderId: userBId,
            receiverId: userAId,
          },
        ],
      },
    });

    expect(friendships).toHaveLength(1);
  });

  afterAll(async () => {
    if (prisma) {
      await prisma.friendship.deleteMany({
        where: {
          OR: [
            {
              senderId: userAId,
              receiverId: userBId,
            },
            {
              senderId: userBId,
              receiverId: userAId,
            },
          ],
        },
      });

      await prisma.user.deleteMany({
        where: {
          id: {
            in: [userAId, userBId],
          },
        },
      });
    }

    if (app) {
      await app.close();
    }
  });
});
