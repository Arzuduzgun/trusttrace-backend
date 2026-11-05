import { Injectable } from '@nestjs/common';
import type { Namespace } from 'socket.io';
import { userChannel } from '../modules/chat/chat.events';

@Injectable()
export class ChatNotifierService {
  private server: Namespace | null = null;

  attach(server: Namespace): void {
    this.server = server;
  }

  notifyUser(userId: string, event: string, payload: object): void {
    this.server?.to(userChannel(userId)).emit(event, payload);
  }

  disconnectUser(userId: string): void {
    this.server?.in(userChannel(userId)).disconnectSockets(true);
  }
}
