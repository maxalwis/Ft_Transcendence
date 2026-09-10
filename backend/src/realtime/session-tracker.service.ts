import { Injectable } from '@nestjs/common';

@Injectable()
export class SessionTrackerService {
  private onlineUsers = new Map<number, Set<string>>();

  addSession(userId: number, socketId: string) {
    if (!this.onlineUsers.has(userId)) {
      this.onlineUsers.set(userId, new Set());
    }
    this.onlineUsers.get(userId)!.add(socketId);
  }

  removeSession(userId: number, socketId: string): boolean {
    const sockets = this.onlineUsers.get(userId);
    if (!sockets) return false;

    sockets.delete(socketId);
    if (sockets.size === 0) {
      this.onlineUsers.delete(userId);
      return true;
    }
    return false;
  }

  isOnline(userId: number): boolean {
    return this.onlineUsers.has(userId);
  }

  getOnlineUserIds(): number[] {
    return [...this.onlineUsers.keys()];
  }
}
