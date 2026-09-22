import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Event interests concurrency (e2e)', () => {
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
    username: `e2e_interest_a_${timestamp}`,
    email: `e2e_interest_a_${timestamp}@test.local`,
    password: 'TestPassword123!',
  };

  const userB = {
    username: `e2e_interest_b_${timestamp}`,
    email: `e2e_interest_b_${timestamp}@test.local`,
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
        source: `e2e-interest-${timestamp}`,
        externalId: `e2e-interest-${timestamp}`,
        title: 'E2E Interest Test Event',
        description: 'Event used for concurrency testing',
        dateStart: new Date(Date.now() + 60 * 60 * 1000),
        dateEnd: new Date(Date.now() + 2 * 60 * 60 * 1000),
        category: [],
      },
    });

    eventId = event.id;
  }, 30000);

  it('prevents duplicate interests when the same user acts concurrently', async () => {
    const [responseA, responseB] = await Promise.all([
      agent(app.getHttpServer())
        .post(`/events/${eventId}/interest`)
        .set('Authorization', `Bearer ${tokenA}`),

      agent(app.getHttpServer())
        .post(`/events/${eventId}/interest`)
        .set('Authorization', `Bearer ${tokenA}`),
    ]);

    expect(responseA.status).toBe(201);
    expect(responseB.status).toBe(201);

    const interests = await prisma.eventInterest.findMany({
      where: {
        userId: userAId,
        eventId,
      },
    });

    expect(interests).toHaveLength(1);
  }, 10000);

  it('allows different users to express interest concurrently', async () => {
    await prisma.eventInterest.deleteMany({
      where: {
        eventId,
        userId: {
          in: [userAId, userBId],
        },
      },
    });

    const [responseA, responseB] = await Promise.all([
      agent(app.getHttpServer())
        .post(`/events/${eventId}/interest`)
        .set('Authorization', `Bearer ${tokenA}`),

      agent(app.getHttpServer())
        .post(`/events/${eventId}/interest`)
        .set('Authorization', `Bearer ${tokenB}`),
    ]);

    expect(responseA.status).toBe(201);
    expect(responseB.status).toBe(201);

    const interests = await prisma.eventInterest.findMany({
      where: {
        eventId,
        userId: {
          in: [userAId, userBId],
        },
      },
    });

    expect(interests).toHaveLength(2);

    const count = await prisma.eventInterest.count({
      where: { eventId },
    });

    expect(count).toBeGreaterThanOrEqual(2);
  }, 10000);

  afterAll(async () => {
    if (prisma) {
      await prisma.eventInterest.deleteMany({
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
