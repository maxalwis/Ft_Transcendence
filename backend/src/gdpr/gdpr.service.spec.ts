import { Test } from '@nestjs/testing';
import { BadRequestException, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { GdprService } from './gdpr.service';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { RealtimeEmitterService } from '../realtime/realtime-emitter.service';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({ compare: jest.fn() }));

const DELETE_PURPOSE = 'gdpr-account-deletion';

// capture a thrown error so we can assert on its type and response body
async function catchError(p: Promise<unknown>): Promise<any> {
  try {
    await p;
    throw new Error('expected the call to throw, but it resolved');
  } catch (e) {
    return e;
  }
}

describe('GdprService.confirmDeletion (deletion hardening)', () => {
  let service: GdprService;
  let prisma: {
    user: { findUnique: jest.Mock; delete: jest.Mock };
    message: { findMany: jest.Mock };
    friendship: { findMany: jest.Mock };
  };
  let jwt: { verifyAsync: jest.Mock; signAsync: jest.Mock };
  let mail: { sendMail: jest.Mock };

  beforeEach(async () => {
    prisma = {
      user: { findUnique: jest.fn(), delete: jest.fn().mockResolvedValue({}) },
      message: { findMany: jest.fn().mockResolvedValue([]) },
      friendship: { findMany: jest.fn().mockResolvedValue([]) },
    };
    jwt = { verifyAsync: jest.fn(), signAsync: jest.fn() };
    mail = { sendMail: jest.fn().mockResolvedValue(undefined) };

    const moduleRef = await Test.createTestingModule({
      providers: [
        GdprService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwt },
        { provide: MailService, useValue: mail },
        {
          provide: RealtimeEmitterService,
          useValue: { emitToUser: jest.fn(), disconnectUser: jest.fn() },
        },
      ],
    }).compile();

    service = moduleRef.get(GdprService);
    (bcrypt.compare as jest.Mock).mockReset();
  });

  it('rejects when the session user is not the token target (403) and deletes nothing', async () => {
    jwt.verifyAsync.mockResolvedValue({ sub: 2, purpose: DELETE_PURPOSE });
    const err = await catchError(service.confirmDeletion(1, 'tok', 'pw'));
    expect(err).toBeInstanceOf(ForbiddenException);
    expect(prisma.user.delete).not.toHaveBeenCalled();
  });

  it('rejects an expired token with code TOKEN_EXPIRED (401)', async () => {
    const expired = new Error('jwt expired');
    expired.name = 'TokenExpiredError';
    jwt.verifyAsync.mockRejectedValue(expired);
    const err = await catchError(service.confirmDeletion(1, 'tok', 'pw'));
    expect(err).toBeInstanceOf(UnauthorizedException);
    expect(err.getResponse()).toMatchObject({ code: 'TOKEN_EXPIRED' });
    expect(prisma.user.delete).not.toHaveBeenCalled();
  });

  it('rejects an invalid token with code TOKEN_INVALID (401)', async () => {
    jwt.verifyAsync.mockRejectedValue(new Error('invalid signature'));
    const err = await catchError(service.confirmDeletion(1, 'tok', 'pw'));
    expect(err).toBeInstanceOf(UnauthorizedException);
    expect(err.getResponse()).toMatchObject({ code: 'TOKEN_INVALID' });
  });

  it('rejects a token with the wrong purpose (400)', async () => {
    jwt.verifyAsync.mockResolvedValue({ sub: 1, purpose: 'access' });
    const err = await catchError(service.confirmDeletion(1, 'tok', 'pw'));
    expect(err).toBeInstanceOf(BadRequestException);
    expect(prisma.user.delete).not.toHaveBeenCalled();
  });

  it('requires a password for password accounts', async () => {
    jwt.verifyAsync.mockResolvedValue({ sub: 1, purpose: DELETE_PURPOSE });
    prisma.user.findUnique.mockResolvedValue({ id: 1, email: 'a@b.c', password: 'hash' });
    const err = await catchError(service.confirmDeletion(1, 'tok', undefined));
    expect(err).toBeInstanceOf(BadRequestException);
    expect(prisma.user.delete).not.toHaveBeenCalled();
  });

  it('rejects a wrong password with code WRONG_PASSWORD (401)', async () => {
    jwt.verifyAsync.mockResolvedValue({ sub: 1, purpose: DELETE_PURPOSE });
    prisma.user.findUnique.mockResolvedValue({ id: 1, email: 'a@b.c', password: 'hash' });
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);
    const err = await catchError(service.confirmDeletion(1, 'tok', 'wrong'));
    expect(err).toBeInstanceOf(UnauthorizedException);
    expect(err.getResponse()).toMatchObject({ code: 'WRONG_PASSWORD' });
    expect(prisma.user.delete).not.toHaveBeenCalled();
  });

  it('deletes a password account when session + token + password are all valid', async () => {
    jwt.verifyAsync.mockResolvedValue({ sub: 1, purpose: DELETE_PURPOSE });
    prisma.user.findUnique.mockResolvedValue({ id: 1, email: 'a@b.c', password: 'hash' });
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    const res = await service.confirmDeletion(1, 'tok', 'correct');
    expect(prisma.user.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    expect(res).toEqual({ deleted: true, userId: 1 });
  });

  it('deletes an OAuth account (no password) with just session + token', async () => {
    jwt.verifyAsync.mockResolvedValue({ sub: 1, purpose: DELETE_PURPOSE });
    prisma.user.findUnique.mockResolvedValue({ id: 1, email: 'a@b.c', password: null });
    const res = await service.confirmDeletion(1, 'tok', undefined);
    expect(bcrypt.compare).not.toHaveBeenCalled();
    expect(prisma.user.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    expect(res).toEqual({ deleted: true, userId: 1 });
  });
});
