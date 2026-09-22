import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Messages concurrency (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  let userAId: number;
  let userBId: number;
  let tokenA: string;
  let tokenB: string;
  let eventId: string;

  const agent = typeof request === 'function' ? request : (request as any).default;

  const timestamp = Date.now();

  const userA = {
    username: `e2e_message_a_${timestamp}`,
    email: `e2e_message_a_${timestamp}@test.local`,
    password: 'TestPassword123!',
  };

  const userB = {
    username: `e2e_message_b_${timestamp}`,
    email: `e2e_message_b_${timestamp}@test.local`,
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

    const event = await prisma.event.create({
      data: {
        source: `e2e-message-${timestamp}`,
        externalId: `e2e-message-${timestamp}`,
        title: 'E2E Message Test Event',
        description: 'Event used for message concurrency testing',
        dateStart: new Date(Date.now() + 60 * 60 * 1000),
        dateEnd: new Date(Date.now() + 2 * 60 * 60 * 1000),
        category: [],
      },
    });

    eventId = event.id;
  }, 30000);

  it('persists concurrent messages with the correct user ownership', async () => {
    const [responseA, responseB] = await Promise.all([
      agent(app.getHttpServer())
        .post(`/events/${eventId}/messages`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          content: 'Message from user A',
        }),

      agent(app.getHttpServer())
        .post(`/events/${eventId}/messages`)
        .set('Authorization', `Bearer ${tokenB}`)
        .send({
          content: 'Message from user B',
        }),
    ]);

    expect(responseA.status).toBe(201);
    expect(responseB.status).toBe(201);

    const messages = await prisma.message.findMany({
      where: {
        eventId,
        userId: {
          in: [userAId, userBId],
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    expect(messages).toHaveLength(2);

    expect(
      messages.some(
        (message) =>
          message.userId === userAId &&
          message.content === 'Message from user A',
      ),
    ).toBe(true);

    expect(
      messages.some(
        (message) =>
          message.userId === userBId &&
          message.content === 'Message from user B',
      ),
    ).toBe(true);
  });

  it('uses the authenticated user instead of a userId supplied by the client', async () => {
    const response = await agent(app.getHttpServer())
      .post(`/events/${eventId}/messages`)
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        content: 'Ownership test',
        userId: userBId,
      })
      .expect(201);

    const message = await prisma.message.findUnique({
      where: {
        id: response.body.id,
      },
    });

    expect(message).not.toBeNull();
    expect(message!.userId).toBe(userAId);
    expect(message!.userId).not.toBe(userBId);
  });

  afterAll(async () => {
    if (prisma) {
      await prisma.message.deleteMany({
        where: {
          eventId,
        },
      });

      await prisma.event.delete({
        where: {
          id: eventId,
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