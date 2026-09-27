import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

const MAILPIT_API_URL = process.env.MAILPIT_API_URL ?? 'http://mailpit:8025';

describe('GDPR (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const agent = typeof request === 'function' ? request : (request as any).default;

  const timestamp = Date.now();

  const createdUserIds: number[] = [];

  async function registerUser(suffix: string) {
    const user = {
      username: `gdpr_e2e_${suffix}_${timestamp}_${Math.random().toString(36).slice(2)}`,
      email: `gdpr_e2e_${suffix}_${timestamp}_${Math.random().toString(36).slice(2)}@test.local`,
      password: 'TestPassword123!',
    };

    const response = await agent(app.getHttpServer()).post('/auth/register').send(user).expect(201);

    createdUserIds.push(response.body.user.id);

    return {
      ...user,
      id: response.body.user.id,
      accessToken: response.body.accessToken,
    };
  }

  /**
   * Mailpit API helper.
   *
   * Mailpit normally exposes its HTTP API on port 8025.
   */
  async function getMailpitMessages() {
    const response = await fetch(`${MAILPIT_API_URL}/api/v1/messages`);

    if (!response.ok) {
      throw new Error(`Mailpit API returned ${response.status}: ${await response.text()}`);
    }

    return response.json();
  }

  /**
   * Waits until Mailpit receives the deletion email and extracts
   * the JWT from the confirmation URL.
   */
  async function waitForDeletionToken(email: string, timeoutMs = 5000): Promise<string> {
    const deadline = Date.now() + timeoutMs;

    while (Date.now() < deadline) {
      const data = await getMailpitMessages();

      const message = data.messages?.find(
        (m: any) =>
          m.Subject === 'Confirm your account deletion' &&
          m.To?.some((to: any) => to.Address === email)
      );

      if (message) {
        const detailResponse = await fetch(`${MAILPIT_API_URL}/api/v1/message/${message.ID}`);

        if (detailResponse.ok) {
          const detail = await detailResponse.json();

          const text = [detail.Text, detail.HTML, detail.text, detail.html]
            .filter(Boolean)
            .join('\n');

          const match = text.match(/\/account\/delete-confirm\?token=([A-Za-z0-9._-]+)/);

          if (match) {
            return match[1];
          }
        }
      }

      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    throw new Error(`Timed out waiting for deletion confirmation email for ${email}`);
  }

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prisma = app.get(PrismaService);
  }, 30000);

  describe('POST /gdpr/delete-request', () => {
    it('sends a real deletion confirmation email without deleting the account', async () => {
      const user = await registerUser('delete-request');

      await agent(app.getHttpServer())
        .post('/gdpr/delete-request')
        .set('Authorization', `Bearer ${user.accessToken}`)
        .expect(201);

      const existingUser = await prisma.user.findUnique({
        where: { id: user.id },
      });

      expect(existingUser).not.toBeNull();

      // Verify that the actual Mailpit email was generated.
      const deletionToken = await waitForDeletionToken(user.email);

      expect(deletionToken).toBeTruthy();
      expect(deletionToken.split('.')).toHaveLength(3);
    }, 15000);
  });

  describe('POST /gdpr/delete-confirm', () => {
    it('deletes a password account using the real email confirmation token', async () => {
      const user = await registerUser('valid');

      // Step 1: request deletion through the real API.
      await agent(app.getHttpServer())
        .post('/gdpr/delete-request')
        .set('Authorization', `Bearer ${user.accessToken}`)
        .expect(201);

      // Step 2: obtain the token from the actual email sent to Mailpit.
      const deletionToken = await waitForDeletionToken(user.email);

      // Step 3: confirm deletion through the real API.
      const response = await agent(app.getHttpServer())
        .post('/gdpr/delete-confirm')
        .set('Authorization', `Bearer ${user.accessToken}`)
        .send({
          token: deletionToken,
          password: user.password,
        })
        .expect(201);

      expect(response.body).toEqual({
        deleted: true,
        userId: user.id,
      });

      // Step 4: verify against the real database.
      const deletedUser = await prisma.user.findUnique({
        where: { id: user.id },
      });

      expect(deletedUser).toBeNull();
    }, 15000);

    it('rejects an incorrect password and keeps the account', async () => {
      const user = await registerUser('wrong-password');

      await agent(app.getHttpServer())
        .post('/gdpr/delete-request')
        .set('Authorization', `Bearer ${user.accessToken}`)
        .expect(201);

      const deletionToken = await waitForDeletionToken(user.email);

      const response = await agent(app.getHttpServer())
        .post('/gdpr/delete-confirm')
        .set('Authorization', `Bearer ${user.accessToken}`)
        .send({
          token: deletionToken,
          password: 'DefinitelyWrongPassword123!',
        })
        .expect(401);

      expect(response.body).toMatchObject({
        code: 'WRONG_PASSWORD',
        message: 'Incorrect password',
      });

      const existingUser = await prisma.user.findUnique({
        where: { id: user.id },
      });

      expect(existingUser).not.toBeNull();
    }, 15000);

    it('rejects confirmation when the password is missing', async () => {
      const user = await registerUser('missing-password');

      await agent(app.getHttpServer())
        .post('/gdpr/delete-request')
        .set('Authorization', `Bearer ${user.accessToken}`)
        .expect(201);

      const deletionToken = await waitForDeletionToken(user.email);

      await agent(app.getHttpServer())
        .post('/gdpr/delete-confirm')
        .set('Authorization', `Bearer ${user.accessToken}`)
        .send({
          token: deletionToken,
        })
        .expect(400);

      const existingUser = await prisma.user.findUnique({
        where: { id: user.id },
      });

      expect(existingUser).not.toBeNull();
    }, 15000);

    it('rejects an invalid deletion token', async () => {
      const user = await registerUser('invalid-token');

      const response = await agent(app.getHttpServer())
        .post('/gdpr/delete-confirm')
        .set('Authorization', `Bearer ${user.accessToken}`)
        .send({
          token: 'not-a-real-token',
          password: user.password,
        })
        .expect(401);

      expect(response.body).toMatchObject({
        code: 'TOKEN_INVALID',
        message: 'Invalid confirmation token',
      });

      const existingUser = await prisma.user.findUnique({
        where: { id: user.id },
      });

      expect(existingUser).not.toBeNull();
    });

    it('rejects a deletion token belonging to another authenticated user', async () => {
      const userA = await registerUser('owner');
      const userB = await registerUser('other-user');

      // Get a real token for User A through the real email flow.
      await agent(app.getHttpServer())
        .post('/gdpr/delete-request')
        .set('Authorization', `Bearer ${userA.accessToken}`)
        .expect(201);

      const deletionTokenForA = await waitForDeletionToken(userA.email);

      // User B tries to use User A's token.
      const response = await agent(app.getHttpServer())
        .post('/gdpr/delete-confirm')
        .set('Authorization', `Bearer ${userB.accessToken}`)
        .send({
          token: deletionTokenForA,
          password: userB.password,
        })
        .expect(403);

      expect(response.body.message).toBe('This confirmation link is not for your account');

      const existingUserA = await prisma.user.findUnique({
        where: { id: userA.id },
      });

      const existingUserB = await prisma.user.findUnique({
        where: { id: userB.id },
      });

      expect(existingUserA).not.toBeNull();
      expect(existingUserB).not.toBeNull();
    }, 15000);
  });

  describe('GET /gdpr/export', () => {
    it('exports the authenticated user data without exposing the password', async () => {
      const user = await registerUser('export');

      const response = await agent(app.getHttpServer())
        .get('/gdpr/export')
        .set('Authorization', `Bearer ${user.accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('exportedAt');
      expect(response.body).toHaveProperty('profile');
      expect(response.body).toHaveProperty('messages');
      expect(response.body).toHaveProperty('friendships');

      expect(response.body.profile.id).toBe(user.id);
      expect(response.body.profile.email).toBe(user.email);
      expect(response.body.profile).not.toHaveProperty('password');

      expect(response.headers['content-type']).toMatch(/application\/json/);
      expect(response.headers['content-disposition']).toContain('attachment');
    }, 15000);
  });

  afterAll(async () => {
    if (prisma && createdUserIds.length > 0) {
      await prisma.user.deleteMany({
        where: {
          id: {
            in: createdUserIds,
          },
        },
      });
    }

    if (prisma) {
      await prisma.$disconnect();
    }

    if (app) {
      await app.close();
    }
  });
});
