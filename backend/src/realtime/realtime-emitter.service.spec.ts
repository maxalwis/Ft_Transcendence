import { Test, TestingModule } from '@nestjs/testing';
import { RealtimeEmitterService } from './realtime-emitter.service';
import { SessionTrackerService } from './session-tracker.service';

describe('RealtimeEmitterService', () => {
  let service: RealtimeEmitterService;
  let sessionTrackerMock: any;
  let serverMock: any;
  let roomMock: any;

  beforeEach(async () => {
    sessionTrackerMock = { getSocketIds: jest.fn() };
    roomMock = { emit: jest.fn() };
    serverMock = {
      to: jest.fn().mockReturnValue(roomMock),
      emit: jest.fn(),
      sockets: { sockets: new Map() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RealtimeEmitterService,
        { provide: SessionTrackerService, useValue: sessionTrackerMock },
      ],
    }).compile();

    service = module.get<RealtimeEmitterService>(RealtimeEmitterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Avant afterInit(), le gateway n'a pas encore appelé setServer() : les
  // méthodes doivent no-op silencieusement plutôt que planter.
  it('should silently no-op when the socket.io server is not yet set', () => {
    sessionTrackerMock.getSocketIds.mockReturnValue([]);

    expect(() => service.emitGlobal('foo', {})).not.toThrow();
    expect(() => service.emitToUser(1, 'foo', {})).not.toThrow();
    expect(() => service.emitToEvent('evt-1', 'foo', {})).not.toThrow();
    expect(() => service.disconnectUser(1)).not.toThrow();
  });

  it('should broadcast to the per-user room', () => {
    service.setServer(serverMock);

    service.emitToUser(1, 'friend:updated', { foo: 'bar' });

    expect(serverMock.to).toHaveBeenCalledWith('user:1');
    expect(roomMock.emit).toHaveBeenCalledWith('friend:updated', { foo: 'bar' });
  });

  it('should broadcast to the per-event room', () => {
    service.setServer(serverMock);

    service.emitToEvent('evt-1', 'chat:new', { text: 'hi' });

    expect(serverMock.to).toHaveBeenCalledWith('event:evt-1');
    expect(roomMock.emit).toHaveBeenCalledWith('chat:new', { text: 'hi' });
  });

  it('should broadcast globally', () => {
    service.setServer(serverMock);

    service.emitGlobal('user:online', { userId: 1 });

    expect(serverMock.emit).toHaveBeenCalledWith('user:online', { userId: 1 });
  });

  it('should force-disconnect every socket of a user', () => {
    service.setServer(serverMock);
    sessionTrackerMock.getSocketIds.mockReturnValue(['socket-a', 'socket-b']);
    const socketA = { disconnect: jest.fn() };
    const socketB = { disconnect: jest.fn() };
    serverMock.sockets.sockets.set('socket-a', socketA);
    serverMock.sockets.sockets.set('socket-b', socketB);

    service.disconnectUser(1);

    expect(socketA.disconnect).toHaveBeenCalledWith(true);
    expect(socketB.disconnect).toHaveBeenCalledWith(true);
  });
});
