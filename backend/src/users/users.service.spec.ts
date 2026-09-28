import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '../generated/prisma/client';
import { removeUploadedAvatar } from './avatar-files';

jest.mock('./avatar-files', () => ({ removeUploadedAvatar: jest.fn() }));

describe('UsersService', () => {
  let service: UsersService;
  let prismaMock: any;

  const mockUser = {
    id: 1,
    name: 'Alice',
    email: 'alice@example.com',
    createdAt: new Date(),
  };

  beforeEach(async () => {
    prismaMock = {
      user: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      refreshToken: {
        updateMany: jest.fn(),
      },
      $transaction: jest.fn((ops: Promise<unknown>[]) => Promise.all(ops)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    it('should return a user if found', async () => {
      prismaMock.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findOne(1);
      expect(result).toEqual(mockUser);
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should throw NotFoundException if user is not found', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('createLocal', () => {
    const newUser = { username: 'alice', email: 'alice@example.com', password: 'plainPassword' };

    it('should store a bcrypt hash, never the plain password', async () => {
      prismaMock.user.create.mockResolvedValue(mockUser);

      const result = await service.createLocal(newUser);

      expect(result).toEqual(mockUser);
      const { data } = prismaMock.user.create.mock.calls[0][0];
      expect(data.password).not.toBe('plainPassword');
      expect(await bcrypt.compare('plainPassword', data.password)).toBe(true);
    });

    it('should throw ConflictException if email or username already exists (P2002)', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
        code: 'P2002',
        clientVersion: '7.0.0',
      });
      prismaMock.user.create.mockRejectedValue(prismaError);

      await expect(service.createLocal(newUser)).rejects.toThrow(ConflictException);
    });
  });

  describe('createOAuth', () => {
    it('should sanitize the provider name and suffix it when already taken', async () => {
      // "Élodie Martin" -> "Elodie_Martin" is taken, "Elodie_Martin1" is free
      prismaMock.user.findUnique.mockResolvedValueOnce({ id: 2 }).mockResolvedValueOnce(null);
      prismaMock.user.create.mockResolvedValue(mockUser);

      await service.createOAuth({
        username: 'Élodie Martin',
        email: 'elodie@example.com',
        provider: 'google',
        providerId: 'g-123',
        avatar: '',
      });

      const { data } = prismaMock.user.create.mock.calls[0][0];
      expect(data.username).toBe('Elodie_Martin1');
      expect(data.password).toBeNull();
    });
  });

  describe('update', () => {
    beforeEach(() => (removeUploadedAvatar as jest.Mock).mockReset());

    it('should delete the previous uploaded avatar file when a new one is saved', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        ...mockUser,
        avatar: '/uploads/avatars/old.png',
      });
      prismaMock.user.update.mockResolvedValue({ ...mockUser, avatar: '/uploads/avatars/new.png' });

      await service.update(1, { avatar: '/uploads/avatars/new.png' });

      expect(removeUploadedAvatar).toHaveBeenCalledWith('/uploads/avatars/old.png');
    });

    it('should keep the avatar file when the avatar is not changed', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        ...mockUser,
        avatar: '/uploads/avatars/old.png',
      });
      prismaMock.user.update.mockResolvedValue(mockUser);

      await service.update(1, { username: 'alice2' });

      expect(removeUploadedAvatar).not.toHaveBeenCalled();
    });
  });

  describe('changePassword', () => {
    it('should update the password and revoke every refresh token of the user', async () => {
      const hash = await bcrypt.hash('oldPassword', 4);
      prismaMock.user.findUnique.mockResolvedValue({ ...mockUser, password: hash });

      await service.changePassword(1, 'oldPassword', 'newPassword');

      expect(prismaMock.$transaction).toHaveBeenCalled();
      expect(prismaMock.user.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 1 } })
      );
      expect(prismaMock.refreshToken.updateMany).toHaveBeenCalledWith({
        where: { userId: 1, revoked: false },
        data: { revoked: true },
      });
    });

    it('should not revoke anything if the current password is wrong', async () => {
      const hash = await bcrypt.hash('oldPassword', 4);
      prismaMock.user.findUnique.mockResolvedValue({ ...mockUser, password: hash });

      await expect(service.changePassword(1, 'wrong', 'newPassword')).rejects.toThrow(
        UnauthorizedException
      );

      expect(prismaMock.refreshToken.updateMany).not.toHaveBeenCalled();
    });
  });
});
