import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { AuthService } from '../auth/auth.service';
import { UsersService } from '../users/users.service';
import { SessionTrackerService } from './session-tracker.service';
import { RealtimeEmitterService } from './realtime-emitter.service';
import { EventsService } from '../events/events.service';
import { User, UserStatus } from '../generated/prisma/browser';
import { LoggerMiddleware } from '../logger.middleware';

@WebSocketGateway({
  cors: { origin: process.env.FRONTEND_URL, credentials: true },
})
export class RealtimeGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(RealtimeGateway.name);
  @WebSocketServer() server!: Server;

  constructor(
    private authService: AuthService,
    private sessionTracker: SessionTrackerService,
    private usersService: UsersService,
    private emitter: RealtimeEmitterService,
    private eventsService: EventsService
  ) {}

  afterInit(server: Server) {
    this.emitter.setServer(server);

    // Middleware d'auth : rejette la connexion avant handleConnection
    server.use(async (socket: Socket, next) => {
      try {
        const token = socket.handshake.auth?.token;

        if (!token) {
          return next(new Error('Unauthorized'));
        }

        socket.data.user = await this.authService.verifyAccessToken(token);

        next();
      } catch (error) {
        next(new Error('Unauthorized'));
      }
    });
  }

  async handleConnection(client: Socket) {
    const userId = client.data.user.id;

    // Le JWT n'est vérifié qu'au handshake : sans ce timer, le socket resterait
    // ouvert indéfiniment après l'expiration du token. On prévient le client
    // (qui se reconnecte avec son token rafraîchi) puis on coupe.
    const msUntilExpiry = client.data.user.exp * 1000 - Date.now();
    client.data.expiryTimer = setTimeout(() => {
      client.emit('session:expired');
      client.disconnect(true);
    }, Math.max(msUntilExpiry, 0));

    client.join(`user:${userId}`);

    this.sessionTracker.addSession(userId, client.id);

    const user = await this.usersService.setStatusIfExists(userId, 'ONLINE');
    if (!user) {
      this.sessionTracker.removeSession(userId, client.id);
      client.disconnect(true);
      return;
    }

    this.emitter.emitGlobal('user:online', { userId });
  }

  async handleDisconnect(client: Socket) {
    clearTimeout(client.data.expiryTimer);

    const userId = client.data.user?.id;
    if (!userId) return;

    const trulyOffline = this.sessionTracker.removeSession(userId, client.id);

    if (trulyOffline) {
      const user = await this.usersService.setStatusIfExists(userId, 'OFFLINE');

      if (user) {
        this.emitter.emitGlobal('user:offline', { userId });
      }

      if (!user) {
        this.logger.warn(`[Realtime] User ${userId} disappeared before disconnect handling`);
      }
    }
  }

  @SubscribeMessage('event:join')
  async handleJoinEvent(@ConnectedSocket() client: Socket, @MessageBody() eventId: string) {
    await this.eventsService.findOne(eventId);

    client.join(`event:${eventId}`);

    return {
      joined: true,
      eventId,
    };
  }

  @SubscribeMessage('event:leave')
  handleLeaveEvent(@ConnectedSocket() client: Socket, @MessageBody() eventId: string) {
    client.leave(`event:${eventId}`);
  }
}
