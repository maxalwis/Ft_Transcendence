import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '../generated/prisma/client';

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

  describe('create', () => {
    it('should create and return a user', async () => {
      prismaMock.user.create.mockResolvedValue(mockUser);

      const result = await service.create({ name: 'Alice', email: 'alice@example.com' });
      expect(result).toEqual(mockUser);
    });

    it('should throw ConflictException if email already exists (P2002)', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
        code: 'P2002',
        clientVersion: '7.0.0',
      });
      prismaMock.user.create.mockRejectedValue(prismaError);

      await expect(service.create({ name: 'Alice', email: 'alice@example.com' })).rejects.toThrow(
        ConflictException
      );
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
