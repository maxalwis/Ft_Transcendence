import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Users authorization (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  let userAId: number;
  let userBId: number;
  let tokenA: string;
  let tokenB: string;

  const agent = typeof request === 'function' ? request : (request as any).default;

  const timestamp = Date.now();

  const userA = {
    username: `e2e_user_a_${timestamp}`,
    email: `e2e_user_a_${timestamp}@test.local`,
    password: 'TestPassword123!',
  };

  const userB = {
    username: `e2e_user_b_${timestamp}`,
    email: `e2e_user_b_${timestamp}@test.local`,
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

  describe('User isolation', () => {
    it('allows a user to update their own account', async () => {
      const updatedUsername = `${userA.username}_updated`;

      await agent(app.getHttpServer())
        .put(`/users/${userAId}`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          username: updatedUsername,
        })
        .expect(200);

      const user = await prisma.user.findUnique({
        where: { id: userAId },
      });

      expect(user?.username).toBe(updatedUsername);
    });

    it('prevents a user from updating another user', async () => {
      const originalUserB = await prisma.user.findUnique({
        where: { id: userBId },
      });

      expect(originalUserB).not.toBeNull();

      await agent(app.getHttpServer())
        .put(`/users/${userBId}`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          username: 'hacked_username',
          email: 'hacked@test.local',
        })
        .expect(403);

      const userBAfterAttempt = await prisma.user.findUnique({
        where: { id: userBId },
      });

      expect(userBAfterAttempt?.username).toBe(originalUserB?.username);
      expect(userBAfterAttempt?.email).toBe(originalUserB?.email);
    });

    it('prevents a user from deleting another user', async () => {
      await agent(app.getHttpServer())
        .delete(`/users/${userBId}`)
        .set('Authorization', `Bearer ${tokenA}`)
        .expect(403);

      const userB = await prisma.user.findUnique({
        where: { id: userBId },
      });

      expect(userB).not.toBeNull();
    });

    it('allows the second user to authenticate independently', async () => {
      await agent(app.getHttpServer())
        .get(`/users/${userBId}`)
        .set('Authorization', `Bearer ${tokenB}`)
        .expect(200);
    });
  });

  afterAll(async () => {
    if (prisma) {
      await prisma.user.deleteMany({
        where: {
          id: {
            in: [userAId, userBId],
          },
        },
      });
    }

    if (app) {
      await prisma.$disconnect();
      await app.close();
    }
  });
});
