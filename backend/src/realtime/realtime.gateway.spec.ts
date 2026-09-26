import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { RealtimeGateway } from './realtime.gateway';
import { AuthService } from '../auth/auth.service';
import { UsersService } from '../users/users.service';
import { MessagesService } from '../messages/messages.service';
import { SessionTrackerService } from './session-tracker.service';
import { RealtimeEmitterService } from './realtime-emitter.service';
import { EventsService } from '../events/events.service';

describe('RealtimeGateway', () => {
  let gateway: RealtimeGateway;
  let authServiceMock: any;
  let usersServiceMock: any;
  let messagesServiceMock: any;
  let sessionTrackerMock: any;
  let emitterMock: any;
  let eventsServiceMock: any;

  const mockClient = (userId?: number) => ({
    id: 'socket-1',
    data: userId !== undefined ? { user: { id: userId } } : {},
    join: jest.fn(),
    leave: jest.fn(),
    disconnect: jest.fn(),
  });

  beforeEach(async () => {
    authServiceMock = { verifyAccessToken: jest.fn() };
    usersServiceMock = { setStatusIfExists: jest.fn() };
    messagesServiceMock = { create: jest.fn() };
    sessionTrackerMock = { addSession: jest.fn(), removeSession: jest.fn() };
    emitterMock = { setServer: jest.fn(), emitGlobal: jest.fn() };
    eventsServiceMock = { findOne: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RealtimeGateway,
        { provide: AuthService, useValue: authServiceMock },
        { provide: UsersService, useValue: usersServiceMock },
        { provide: MessagesService, useValue: messagesServiceMock },
        { provide: SessionTrackerService, useValue: sessionTrackerMock },
        { provide: RealtimeEmitterService, useValue: emitterMock },
        { provide: EventsService, useValue: eventsServiceMock },
      ],
    }).compile();

    gateway = module.get<RealtimeGateway>(RealtimeGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  describe('handleConnection', () => {
    it('should join the per-user room, track the session and broadcast presence', async () => {
      const client = mockClient(1);
      usersServiceMock.setStatusIfExists.mockResolvedValue({ id: 1, status: 'ONLINE' });

      await gateway.handleConnection(client as any);

      expect(client.join).toHaveBeenCalledWith('user:1');
      expect(sessionTrackerMock.addSession).toHaveBeenCalledWith(1, 'socket-1');
      expect(usersServiceMock.setStatusIfExists).toHaveBeenCalledWith(1, 'ONLINE');
      expect(emitterMock.emitGlobal).toHaveBeenCalledWith('user:online', { userId: 1 });
    });

    // Cas où l'utilisateur a été supprimé (GDPR, etc.) entre l'auth du socket
    // et ce moment : il faut annuler la session déjà enregistrée et couper la connexion.
    it('should roll back the session and disconnect if the user no longer exists', async () => {
      const client = mockClient(1);
      usersServiceMock.setStatusIfExists.mockResolvedValue(null);

      await gateway.handleConnection(client as any);

      expect(sessionTrackerMock.removeSession).toHaveBeenCalledWith(1, 'socket-1');
      expect(client.disconnect).toHaveBeenCalledWith(true);
      expect(emitterMock.emitGlobal).not.toHaveBeenCalled();
    });
  });

  describe('handleDisconnect', () => {
    it('should do nothing if the socket never had an authenticated user', async () => {
      const client = mockClient(undefined);

      await gateway.handleDisconnect(client as any);

      expect(sessionTrackerMock.removeSession).not.toHaveBeenCalled();
    });

    it('should broadcast offline only when it was the last open session', async () => {
      const client = mockClient(1);
      sessionTrackerMock.removeSession.mockReturnValue(true);
      usersServiceMock.setStatusIfExists.mockResolvedValue({ id: 1, status: 'OFFLINE' });

      await gateway.handleDisconnect(client as any);

      expect(emitterMock.emitGlobal).toHaveBeenCalledWith('user:offline', { userId: 1 });
    });

    it('should not broadcast offline while other sessions of the user remain', async () => {
      const client = mockClient(1);
      sessionTrackerMock.removeSession.mockReturnValue(false);

      await gateway.handleDisconnect(client as any);

      expect(usersServiceMock.setStatusIfExists).not.toHaveBeenCalled();
      expect(emitterMock.emitGlobal).not.toHaveBeenCalled();
    });
  });

  describe('handleMessage', () => {
    it('should reject a message with no eventId before hitting the service', async () => {
      const client = mockClient(1);

      await expect(gateway.handleMessage(client as any, {} as any)).rejects.toThrow(
        BadRequestException
      );
      expect(messagesServiceMock.create).not.toHaveBeenCalled();
    });

    it('should create the message on behalf of the authenticated socket user', async () => {
      const client = mockClient(1);
      const dto = { eventId: 'evt-1', content: 'hi' } as any;

      await gateway.handleMessage(client as any, dto);

      expect(messagesServiceMock.create).toHaveBeenCalledWith(1, dto);
    });
  });

  describe('handleJoinEvent', () => {
    it('should throw if the event does not exist, without joining the room', async () => {
      const client = mockClient(1);
      eventsServiceMock.findOne.mockRejectedValue(new Error('not found'));

      await expect(gateway.handleJoinEvent(client as any, 'evt-1')).rejects.toThrow();
      expect(client.join).not.toHaveBeenCalled();
    });

    it('should join the per-event room once the event is confirmed to exist', async () => {
      const client = mockClient(1);
      eventsServiceMock.findOne.mockResolvedValue({ id: 'evt-1' });

      const result = await gateway.handleJoinEvent(client as any, 'evt-1');

      expect(client.join).toHaveBeenCalledWith('event:evt-1');
      expect(result).toEqual({ joined: true, eventId: 'evt-1' });
    });
  });
});
