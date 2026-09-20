import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { io, Socket } from 'socket.io-client';
import { AddressInfo } from 'net';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Realtime multi-user concurrency (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let serverUrl: string;

  let userAId: number;
  let userBId: number;
  let tokenA: string;
  let tokenB: string;
  let eventId: string;

  const sockets: Socket[] = [];

  const agent = typeof request === 'function' ? request : (request as any).default;

  const timestamp = Date.now();

  const userA = {
    username: `e2e_realtime_a_${timestamp}`,
    email: `e2e_realtime_a_${timestamp}@test.local`,
    password: 'TestPassword123!',
  };

  const userB = {
    username: `e2e_realtime_b_${timestamp}`,
    email: `e2e_realtime_b_${timestamp}@test.local`,
    password: 'TestPassword123!',
  };

  const joinEvent = (socket: Socket, eventId: string): Promise<void> =>
    new Promise((resolve, reject) => {
      socket.emit('event:join', eventId, (response: { joined: boolean; eventId: string }) => {
        if (!response?.joined || response.eventId !== eventId) {
          reject(new Error(`Failed to join event ${eventId}`));
          return;
        }

        resolve();
      });
    });

  const waitForEvent = <T>(socket: Socket, event: string, timeout = 5000): Promise<T> =>
    new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        socket.off(event, handler);
        reject(new Error(`Timed out waiting for "${event}"`));
      }, timeout);

      const handler = (payload: T) => {
        clearTimeout(timer);
        socket.off(event, handler);
        resolve(payload);
      };

      socket.once(event, handler);
    });

  const connectSocket = (token: string): Promise<Socket> =>
    new Promise((resolve, reject) => {
      const socket = io(serverUrl, {
        auth: {
          token,
        },
        transports: ['websocket'],
      });

      sockets.push(socket);

      const timer = setTimeout(() => {
        console.log('SOCKET CONNECTION TIMEOUT');
        console.log('socket.connected:', socket.connected);
        console.log('socket.id:', socket.id);
        socket.disconnect();
        reject(new Error('Timed out connecting Socket.IO client'));
      }, 5000);

      socket.once('connect', () => {
        clearTimeout(timer);
        resolve(socket);
      });

      socket.once('connect_error', (error) => {
        console.log('SOCKET CONNECT ERROR:', error.message);
        clearTimeout(timer);
        socket.disconnect();
        reject(error);
      });
    });

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.listen(0);

    const address = app.getHttpServer().address() as AddressInfo;

    serverUrl = `http://127.0.0.1:${address.port}`;

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
        source: `e2e-realtime-${timestamp}`,
        externalId: `e2e-realtime-${timestamp}`,
        title: 'E2E Realtime Test Event',
        description: 'Event used for Socket.IO concurrency testing',
        dateStart: new Date(Date.now() + 60 * 60 * 1000),
        dateEnd: new Date(Date.now() + 2 * 60 * 60 * 1000),
        category: [],
      },
    });

    eventId = event.id;
  }, 30000);

  afterEach(() => {
    for (const socket of sockets) {
      socket.disconnect();
    }

    sockets.length = 0;
  });

  it('authenticates two users and delivers realtime messages between them', async () => {
    const socketA = await connectSocket(tokenA);
    const socketB = await connectSocket(tokenB);

    await joinEvent(socketA, eventId);
    await joinEvent(socketB, eventId);

    const messagePromise = waitForEvent<{
      id: number;
      content: string;
      userId: number;
      eventId: string;
    }>(socketB, 'message:new');

    socketA.emit('message:send', {
      content: 'Realtime message from user A',
      eventId,
    });

    const message = await messagePromise;

    expect(message.content).toBe('Realtime message from user A');
    expect(message.userId).toBe(userAId);
    expect(message.eventId).toBe(eventId);
  });

  it('delivers interest updates to users in the event room', async () => {
    const socketA = await connectSocket(tokenA);
    const socketB = await connectSocket(tokenB);

    await joinEvent(socketA, eventId);
    await joinEvent(socketB, eventId);

    const updatePromise = waitForEvent<{
      eventId: string;
      count: number;
    }>(socketB, 'interest:updated');

    await agent(app.getHttpServer())
      .post(`/events/${eventId}/interest`)
      .set('Authorization', `Bearer ${tokenA}`)
      .expect(201);

    const update = await updatePromise;

    expect(update.eventId).toBe(eventId);
    expect(update.count).toBeGreaterThanOrEqual(1);
  });

  it('delivers a new friend request to the recipient', async () => {
    const socketB = await connectSocket(tokenB);

    const requestPromise = waitForEvent<{
      senderId: number;
    }>(socketB, 'friend:request:new');

    const response = await agent(app.getHttpServer())
      .post(`/friends/request/${userBId}`)
      .set('Authorization', `Bearer ${tokenA}`);

    expect(response.status).toBe(201);

    const notification = await requestPromise;

    expect(notification.senderId).toBe(userAId);
  }, 10000);

  it('keeps a user online while another socket for the same user remains connected', async () => {
    const socketA1 = await connectSocket(tokenA);
    const socketA2 = await connectSocket(tokenA);

    await expectUserStatus(userAId, 'ONLINE');

    socketA1.disconnect();

    await expectUserStatus(userAId, 'ONLINE');

    socketA2.disconnect();

    await expectUserStatus(userAId, 'OFFLINE');
  }, 10000);

  it('marks a user online again after reconnecting', async () => {
    const socketA = await connectSocket(tokenA);

    await expectUserStatus(userAId, 'ONLINE');

    socketA.disconnect();

    await expectUserStatus(userAId, 'OFFLINE');

    const socketAReconnected = await connectSocket(tokenA);

    await expectUserStatus(userAId, 'ONLINE');

    socketAReconnected.disconnect();
  }, 10000);

  it('rejects a socket connection with an invalid token', async () => {
    const socket = io(serverUrl, {
      auth: {
        token: 'invalid-token',
      },
      transports: ['websocket'],
    });

    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => {
        socket.disconnect();
        reject(new Error('Expected Socket.IO authentication to fail'));
      }, 5000);

      socket.once('connect', () => {
        clearTimeout(timer);
        socket.disconnect();
        reject(new Error('Socket connected with an invalid token'));
      });

      socket.once('connect_error', (error) => {
        clearTimeout(timer);

        expect(error.message).toBe('Unauthorized');

        socket.disconnect();
        resolve();
      });
    });
  });

  async function expectUserStatus(userId: number, expectedStatus: 'ONLINE' | 'OFFLINE') {
    await waitForCondition(async () => {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      return user?.status === expectedStatus;
    });
  }

  async function waitForCondition(condition: () => Promise<boolean>, timeout = 5000) {
    const start = Date.now();

    while (Date.now() - start < timeout) {
      if (await condition()) {
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, 50));
    }

    throw new Error('Timed out waiting for condition');
  }

  afterAll(async () => {
    for (const socket of sockets) {
      socket.disconnect();
    }

    if (prisma) {
      await prisma.message.deleteMany({
        where: {
          eventId,
        },
      });

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
