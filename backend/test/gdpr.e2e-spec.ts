import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import * as bcrypt from 'bcrypt';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { AuthService } from '../src/auth/auth.service';
import { MailService } from '../src/mail/mail.service';

type SentMail = { to: string; subject: string; text: string; html?: string };

describe('GDPR (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authService: AuthService;

  const agent = typeof request === 'function' ? request : (request as any).default;

  const timestamp = Date.now();

  const createdUserIds: number[] = [];

  // In-memory mailbox: the real GdprService builds and "sends" the emails,
  // we capture them here instead of going through SMTP (the container .env
  // points at a real Gmail account, tests must never send real emails).
  const sentMails: SentMail[] = [];
  const fakeMailService = {
    sendMail: async (options: SentMail) => {
      sentMails.push(options);
    },
  };

  // Users are inserted directly and logged in through the real AuthService:
  // POST /auth/register is rate-limited (5/min per IP), and registration is
  // not what this suite tests. The password is still a real bcrypt hash so
  // the deletion password check runs for real.
  async function registerUser(suffix: string) {
    const unique = `${suffix}_${timestamp}_${Math.random().toString(36).slice(2)}`;
    const user = {
      username: `gdpr_e2e_${unique}`,
      email: `gdpr_e2e_${unique}@test.local`,
      password: 'TestPassword123!',
    };

    const created = await prisma.user.create({
      data: {
        username: user.username,
        email: user.email,
        password: await bcrypt.hash(user.password, 10),
      },
    });

    createdUserIds.push(created.id);

    const { accessToken } = await authService.login(created);

    return {
      ...user,
      id: created.id,
      accessToken,
    };
  }

  /**
   * Finds the deletion email sent to `email` and extracts the JWT from its
   * confirmation URL, exactly like a user clicking the link would.
   */
  function getDeletionToken(email: string): string {
    const mail = sentMails.find(
      (m) => m.to === email && m.subject === 'Confirm your account deletion'
    );

    if (!mail) {
      throw new Error(`No deletion confirmation email was sent to ${email}`);
    }

    const match = [mail.text, mail.html]
      .filter(Boolean)
      .join('\n')
      .match(/\/account\/delete-confirm\?token=([A-Za-z0-9._-]+)/);

    if (!match) {
      throw new Error(`Deletion email for ${email} has no confirmation link`);
    }

    return match[1];
  }

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(MailService)
      .useValue(fakeMailService)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prisma = app.get(PrismaService);
    authService = app.get(AuthService);
  }, 30000);

  describe('POST /gdpr/delete-request', () => {
    it('sends a deletion confirmation email without deleting the account', async () => {
      const user = await registerUser('delete-request');

      await agent(app.getHttpServer())
        .post('/gdpr/delete-request')
        .set('Authorization', `Bearer ${user.accessToken}`)
        .expect(201);

      const existingUser = await prisma.user.findUnique({
        where: { id: user.id },
      });

      expect(existingUser).not.toBeNull();

      // Verify that the confirmation email was sent with a valid link.
      const deletionToken = getDeletionToken(user.email);

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

      // Step 2: obtain the token from the confirmation email.
      const deletionToken = getDeletionToken(user.email);

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

      const deletionToken = getDeletionToken(user.email);

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

      const deletionToken = getDeletionToken(user.email);

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

      const deletionTokenForA = getDeletionToken(userA.email);

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
