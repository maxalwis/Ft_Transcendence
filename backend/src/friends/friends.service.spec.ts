import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { FriendsService } from './friends.service';
import { PrismaService } from '../prisma/prisma.service';
import { RealtimeEmitterService } from '../realtime/realtime-emitter.service';
import { Prisma } from '../generated/prisma/client';

describe('FriendsService', () => {
  let service: FriendsService;
  let prismaMock: any;
  let emitterMock: any;

  beforeEach(async () => {
    prismaMock = {
      user: {
        findUnique: jest.fn(),
      },
      friendship: {
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        findMany: jest.fn(),
        deleteMany: jest.fn(),
      },
    };

    emitterMock = {
      emitToUser: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FriendsService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: RealtimeEmitterService, useValue: emitterMock },
      ],
    }).compile();

    service = module.get<FriendsService>(FriendsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendFriendRequest', () => {
    it('should throw BadRequestException when sending a request to oneself', async () => {
      await expect(service.sendFriendRequest(1, 1)).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if the receiver does not exist', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(service.sendFriendRequest(1, 2)).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException if a request or friendship already exists', async () => {
      prismaMock.user.findUnique.mockResolvedValue({ id: 2 });
      prismaMock.friendship.findFirst.mockResolvedValue({ id: 10 });

      await expect(service.sendFriendRequest(1, 2)).rejects.toThrow(ConflictException);
    });

    it('should create the friendship and notify both users', async () => {
      prismaMock.user.findUnique.mockResolvedValue({ id: 2 });
      prismaMock.friendship.findFirst.mockResolvedValue(null);
      const friendship = { id: 10, senderId: 1, receiverId: 2, status: 'PENDING' };
      prismaMock.friendship.create.mockResolvedValue(friendship);

      const result = await service.sendFriendRequest(1, 2);

      expect(result).toEqual(friendship);
      expect(emitterMock.emitToUser).toHaveBeenCalledWith(1, 'friend:request:new', {
        receiverId: 2,
      });
      expect(emitterMock.emitToUser).toHaveBeenCalledWith(2, 'friend:request:new', {
        senderId: 1,
      });
    });

    // Cas concurrence : deux inserts simultanés passent le check findFirst, seule
    // la contrainte unique en base les distingue.
    it('should map a P2002 unique constraint error to a ConflictException', async () => {
      prismaMock.user.findUnique.mockResolvedValue({ id: 2 });
      prismaMock.friendship.findFirst.mockResolvedValue(null);
      const prismaError = new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
        code: 'P2002',
        clientVersion: '7.0.0',
      });
      prismaMock.friendship.create.mockRejectedValue(prismaError);

      await expect(service.sendFriendRequest(1, 2)).rejects.toThrow(ConflictException);
    });
  });

  describe('acceptFriendRequest', () => {
    it('should throw NotFoundException if there is no pending request', async () => {
      prismaMock.friendship.findFirst.mockResolvedValue(null);

      await expect(service.acceptFriendRequest(1, 2)).rejects.toThrow(NotFoundException);
    });

    it('should accept the pending request and notify both users', async () => {
      prismaMock.friendship.findFirst.mockResolvedValue({ id: 10 });
      const accepted = { id: 10, status: 'ACCEPTED' };
      prismaMock.friendship.update.mockResolvedValue(accepted);

      const result = await service.acceptFriendRequest(1, 2);

      expect(result).toEqual(accepted);
      expect(prismaMock.friendship.update).toHaveBeenCalledWith({
        where: { id: 10 },
        data: { status: 'ACCEPTED' },
      });
      expect(emitterMock.emitToUser).toHaveBeenCalledWith(
        1,
        'friend:updated',
        expect.objectContaining({ friendId: 2, action: 'accepted' })
      );
      expect(emitterMock.emitToUser).toHaveBeenCalledWith(
        2,
        'friend:updated',
        expect.objectContaining({ friendId: 1, action: 'accepted' })
      );
    });
  });

  describe('rejectFriendRequest', () => {
    it('should throw NotFoundException if there is no pending request', async () => {
      prismaMock.friendship.findFirst.mockResolvedValue(null);

      await expect(service.rejectFriendRequest(1, 2)).rejects.toThrow(NotFoundException);
    });

    it('should delete the pending request', async () => {
      prismaMock.friendship.findFirst.mockResolvedValue({ id: 10 });
      prismaMock.friendship.delete.mockResolvedValue({ id: 10 });

      const result = await service.rejectFriendRequest(1, 2);

      expect(result).toEqual({ id: 10 });
      expect(prismaMock.friendship.delete).toHaveBeenCalledWith({ where: { id: 10 } });
    });
  });

  describe('getUserFriends', () => {
    // Vérifie qu'on ramène bien "l'autre" utilisateur, quel que soit le sens
    // sender/receiver de la ligne en base.
    it('should return the other side of each accepted friendship', async () => {
      prismaMock.friendship.findMany.mockResolvedValue([
        { senderId: 1, receiverId: 2, sender: { id: 1 }, receiver: { id: 2 } },
        { senderId: 3, receiverId: 1, sender: { id: 3 }, receiver: { id: 1 } },
      ]);

      const result = await service.getUserFriends(1);

      expect(result).toEqual([{ id: 2 }, { id: 3 }]);
    });
  });

  describe('removeFriend', () => {
    it('should throw NotFoundException if no friendship was deleted', async () => {
      prismaMock.friendship.deleteMany.mockResolvedValue({ count: 0 });

      await expect(service.removeFriend(1, 2)).rejects.toThrow(NotFoundException);
    });

    it('should remove the friendship and notify both users', async () => {
      prismaMock.friendship.deleteMany.mockResolvedValue({ count: 1 });

      const result = await service.removeFriend(1, 2);

      expect(result).toEqual({ success: true });
      expect(emitterMock.emitToUser).toHaveBeenCalledWith(
        1,
        'friend:updated',
        expect.objectContaining({ friendId: 2, action: 'removed' })
      );
      expect(emitterMock.emitToUser).toHaveBeenCalledWith(
        2,
        'friend:updated',
        expect.objectContaining({ friendId: 1, action: 'removed' })
      );
    });
  });

  describe('getFriendIds', () => {
    it('should return the id of the other side of each accepted friendship', async () => {
      prismaMock.friendship.findMany.mockResolvedValue([
        { senderId: 1, receiverId: 2 },
        { senderId: 3, receiverId: 1 },
      ]);

      const result = await service.getFriendIds(1);

      expect(result).toEqual([2, 3]);
    });
  });
});
