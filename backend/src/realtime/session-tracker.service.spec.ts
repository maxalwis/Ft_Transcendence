import { Test, TestingModule } from '@nestjs/testing';
import { SessionTrackerService } from './session-tracker.service';

describe('SessionTrackerService', () => {
  let service: SessionTrackerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SessionTrackerService],
    }).compile();

    service = module.get<SessionTrackerService>(SessionTrackerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should consider a user online only after a session is added', () => {
    expect(service.isOnline(1)).toBe(false);

    service.addSession(1, 'socket-a');

    expect(service.isOnline(1)).toBe(true);
  });

  it('should track multiple sockets for the same user (multi-tab/device)', () => {
    service.addSession(1, 'socket-a');
    service.addSession(1, 'socket-b');

    expect(service.getSocketIds(1).sort()).toEqual(['socket-a', 'socket-b']);
  });

  it('should stay online while at least one socket remains', () => {
    service.addSession(1, 'socket-a');
    service.addSession(1, 'socket-b');

    const trulyOffline = service.removeSession(1, 'socket-a');

    expect(trulyOffline).toBe(false);
    expect(service.isOnline(1)).toBe(true);
  });

  it('should report truly offline only when the last socket is removed', () => {
    service.addSession(1, 'socket-a');

    const trulyOffline = service.removeSession(1, 'socket-a');

    expect(trulyOffline).toBe(true);
    expect(service.isOnline(1)).toBe(false);
  });

  it('should return false when removing a session for a user that was never online', () => {
    expect(service.removeSession(99, 'socket-x')).toBe(false);
  });

  it('should list every currently online user', () => {
    service.addSession(1, 'socket-a');
    service.addSession(2, 'socket-b');

    expect(service.getOnlineUserIds().sort()).toEqual([1, 2]);
  });

  // getSocketIds() renvoie une copie défensive, cf. commentaire dans le service :
  // un caller itère souvent dessus pour déconnecter des sockets, ce qui mute
  // le Set interne via removeSession() si ce n'était pas une copie.
  it('should return a snapshot that is not affected by later mutations', () => {
    service.addSession(1, 'socket-a');
    const snapshot = service.getSocketIds(1);

    service.removeSession(1, 'socket-a');

    expect(snapshot).toEqual(['socket-a']);
  });
});
