import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { RealtimeEmitterService } from '../realtime/realtime-emitter.service';
import { removeUploadedAvatar } from '../users/avatar-files';
import { deletedNoticeMail, deletionConfirmMail, exportNoticeMail } from './gdpr-mails';

const DELETE_PURPOSE = 'gdpr-account-deletion';

@Injectable()
export class GdprService {
  private readonly logger = new Logger(GdprService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly mail: MailService,
    private readonly emitter: RealtimeEmitterService
  ) {}

  /** Gather everything we store about the user, in a readable shape. */
  async exportData(userId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const [messages, sent, received, likedEvents] = await Promise.all([
      this.prisma.message.findMany({ where: { userId } }),
      this.prisma.friendship.findMany({ where: { senderId: userId } }),
      this.prisma.friendship.findMany({ where: { receiverId: userId } }),
      this.prisma.eventInterest.findMany({ where: { userId }, include: { event: true } }),
    ]);

    // never export sensitive credentials back to the caller
    const { password, ...profile } = user;

    if (user.email) {
      try {
        await this.mail.sendMail({ to: user.email, ...exportNoticeMail(user.preferredLanguage) });
      } catch (err) {
        // The export itself succeeded; a notification email is a courtesy, not the deliverable.
        this.logger.warn(`Failed to send data export notification to user ${userId}: ${err}`);
      }
    }

    return {
      exportedAt: new Date().toISOString(),
      profile,
      messages,
      friendships: { sent, received },
      likedEvents,
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
    try {
      await this.mail.sendMail({
        to: user.email,
        ...deletionConfirmMail(user.preferredLanguage, confirmUrl),
      });
    } catch (err) {
      // Here the email IS the deliverable: without it the user has no way to confirm.
      this.logger.error(`Failed to send deletion confirmation email to user ${userId}: ${err}`);
      throw new ServiceUnavailableException(
        'Unable to send confirmation email. Please try again later.'
      );
    }
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
    // Le fichier de l'avatar uploadé fait partie des données personnelles
    await removeUploadedAvatar(user.avatar);

    // La confirmation se fait dans l'onglet ouvert depuis l'email : les autres
    // onglets de l'utilisateur sont prévenus pour se déconnecter, puis leurs
    // sockets (authentifiés par un JWT encore valide) sont fermés.
    this.emitter.emitToUser(payload.sub, 'account:deleted', {});
    this.emitter.disconnectUser(payload.sub);

    if (user.email) {
      try {
        await this.mail.sendMail({ to: user.email, ...deletedNoticeMail(user.preferredLanguage) });
      } catch (err) {
        // The account is already deleted at this point; the email is just a notice.
        this.logger.warn(`Failed to send deletion notice to user ${payload.sub}: ${err}`);
      }
    }

    return { deleted: true, userId: payload.sub };
  }
}
