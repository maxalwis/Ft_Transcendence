import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';

const DELETE_PURPOSE = 'gdpr-account-deletion';

@Injectable()
export class GdprService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly mail: MailService
  ) {}

  /** Gather everything we store about the user, in a readable shape. */
  async exportData(userId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const [messages, sent, received] = await Promise.all([
      this.prisma.message.findMany({ where: { userId } }),
      this.prisma.friendship.findMany({ where: { senderId: userId } }),
      this.prisma.friendship.findMany({ where: { receiverId: userId } }),
    ]);

    // never export sensitive credentials back to the caller
    const { password, ...profile } = user;

    if (user.email) {
      await this.mail.sendMail({
        to: user.email,
        subject: 'Your data export',
        text: 'You requested a copy of your data. It was generated and downloaded from your account.',
      });
    }

    return {
      exportedAt: new Date().toISOString(),
      profile,
      messages,
      friendships: { sent, received },
    };
  }

  /** Step 1: email a short-lived confirmation link. Nothing is deleted yet. */
  async requestDeletion(userId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user?.email) throw new NotFoundException('User email not found');

    const token = await this.jwt.signAsync(
      { sub: userId, purpose: DELETE_PURPOSE },
      { secret: process.env.JWT_SECRET, expiresIn: '15m' }
    );

    const appUrl = process.env.APP_URL ?? 'https://localhost:8443';
    const confirmUrl = `${appUrl}/account/delete-confirm?token=${token}`;
    await this.mail.sendMail({
      to: user.email,
      subject: 'Confirm your account deletion',
      text:
        'You requested to permanently delete your account. This cannot be undone.\n\n' +
        `To confirm, open this link within 15 minutes:\n\n${confirmUrl}`,
      html:
        '<p>You requested to permanently delete your account. This cannot be undone.</p>' +
        `<p><a href="${confirmUrl}">Confirm account deletion</a> (valid for 15 minutes)</p>`,
    });
  }

  /**
   * Step 2: delete the account. Requires three proofs:
   *  - the emailed token (proves control of the account's email),
   *  - the logged-in session matching the token's target (proves account ownership),
   *  - the current password for password accounts (defends a left-open session).
   * OAuth accounts have no password, so session + token is the proof for them.
   * Failures carry a machine-readable `code` so the frontend can show the right
   * message (expired link vs wrong password, which otherwise share HTTP 401).
   */
  async confirmDeletion(sessionUserId: number, token: string, password?: string) {
    let payload: { sub: number; purpose?: string };
    try {
      payload = await this.jwt.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });
    } catch (err) {
      if (err instanceof Error && err.name === 'TokenExpiredError') {
        throw new UnauthorizedException({
          code: 'TOKEN_EXPIRED',
          message: 'Confirmation link has expired',
        });
      }
      throw new UnauthorizedException({
        code: 'TOKEN_INVALID',
        message: 'Invalid confirmation token',
      });
    }
    if (payload.purpose !== DELETE_PURPOSE) {
      throw new BadRequestException('Wrong token type');
    }
    if (sessionUserId !== payload.sub) {
      throw new ForbiddenException('This confirmation link is not for your account');
    }

    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) throw new NotFoundException('User not found');

    if (user.password) {
      if (!password) {
        throw new BadRequestException('Password is required to confirm deletion');
      }
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        throw new UnauthorizedException({
          code: 'WRONG_PASSWORD',
          message: 'Incorrect password',
        });
      }
    }

    await this.prisma.user.delete({ where: { id: payload.sub } });

    if (user.email) {
      await this.mail.sendMail({
        to: user.email,
        subject: 'Your account has been deleted',
        text: 'Your account and all associated data have been permanently deleted.',
      });
    }

    return { deleted: true, userId: payload.sub };
  }
}
