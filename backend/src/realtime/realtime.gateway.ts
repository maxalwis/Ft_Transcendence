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
import { UsePipes, ValidationPipe, Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { AuthService } from '../auth/auth.service';
import { UsersService } from '../users/users.service';
import { MessagesService } from '../messages/messages.service';
import { CreateMessageDto } from '../messages/dto/create-message.dto';
import { SessionTrackerService } from './session-tracker.service';
import { RealtimeEmitterService } from './realtime-emitter.service';

@WebSocketGateway({
  cors: { origin: process.env.FRONTEND_URL, credentials: true },
})
export class RealtimeGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server!: Server;
    private readonly logger = new Logger(RealtimeGateway.name);

  constructor(
    private authService: AuthService,
    private sessionTracker: SessionTrackerService,
    private usersService: UsersService,
    private messagesService: MessagesService,
    private emitter: RealtimeEmitterService
  ) {}

  afterInit(server: Server) {
    this.emitter.setServer(server);

    // Middleware d'auth : rejette la connexion avant handleConnection
    server.use(async (socket: Socket, next) => {
      try {
        const token = socket.handshake.auth?.token;
        if (!token) return next(new Error('Unauthorized'));

        socket.data.user = await this.authService.verifyAccessToken(token);
        next();
      } catch {
        next(new Error('Unauthorized'));
      }
    });
  }

  async handleConnection(client: Socket) {
    const userId = client.data.user.id;
    this.sessionTracker.addSession(userId, client.id);
    await this.usersService.setStatus(userId, 'ONLINE');
    this.emitter.emitGlobal('user:online', { userId });
  }

  async handleDisconnect(client: Socket) {
    const userId = client.data.user?.id;
    if (!userId) return;

    const trulyOffline = this.sessionTracker.removeSession(userId, client.id);
    if (trulyOffline) {
      await this.usersService.setStatus(userId, 'OFFLINE');
      this.emitter.emitGlobal('user:offline', { userId });
    }
  }

  @SubscribeMessage('event:join')
  handleJoinEvent(@ConnectedSocket() client: Socket, @MessageBody() eventId: string) {
    client.join(`event:${eventId}`);
  }

  @SubscribeMessage('event:leave')
  handleLeaveEvent(@ConnectedSocket() client: Socket, @MessageBody() eventId: string) {
    client.leave(`event:${eventId}`);
  }

  @UsePipes(new ValidationPipe())
  @SubscribeMessage('message:send')
  async handleMessage(@ConnectedSocket() client: Socket, @MessageBody() dto: CreateMessageDto) {
    if (!dto.eventId) throw new Error('eventId is required');
    return this.messagesService.create(client.data.user.id, dto);
  }
}
