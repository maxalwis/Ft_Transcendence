import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';
import { SessionTrackerService } from './session-tracker.service';

@Injectable()
export class RealtimeEmitterService {
  private server!: Server;

  constructor(private sessionTracker: SessionTrackerService) {}

  setServer(server: Server) {
    this.server = server;
  }

  emitToEvent(eventId: string, event: string, payload: unknown) {
    this.server?.to(`event:${eventId}`).emit(event, payload);
  }

  emitGlobal(event: string, payload: unknown) {
    this.server?.emit(event, payload);
  }

  // Ferme de force les sockets ouverts d'un utilisateur (ex: logout), pour
  // que le JWT stateless du socket ne reste pas exploitable après invalidation.
  disconnectUser(userId: number) {
    for (const socketId of this.sessionTracker.getSocketIds(userId)) {
      this.server?.sockets.sockets.get(socketId)?.disconnect(true);
    }
  }

  emitToUser(userId: number, event: string, payload: unknown) {
    this.server?.to(`user:${userId}`).emit(event, payload);
  }
}
