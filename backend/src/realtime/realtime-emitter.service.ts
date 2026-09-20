import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';

@Injectable()
export class RealtimeEmitterService {
  private server!: Server;

  setServer(server: Server) {
    this.server = server;
  }

  emitToEvent(eventId: string, event: string, payload: unknown) {
    this.server?.to(`event:${eventId}`).emit(event, payload);
  }

  emitGlobal(event: string, payload: unknown) {
    this.server?.emit(event, payload);
  }

  emitToUser(userId: number, event: string, payload: unknown) {
    this.server?.to(`user:${userId}`).emit(event, payload);
  }
}
