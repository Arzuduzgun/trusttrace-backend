//Başka modüllerin socket’e bir şey göndermesini sağlayan küçük bir kapı.
import { Injectable } from '@nestjs/common';
import type { Namespace } from 'socket.io';
import { userChannel } from './chat.events';

@Injectable()
export class ChatNotifierService {
  private server: Namespace | null = null;

  attach(server: Namespace): void {
    this.server = server;
  }

  //Kişinin açık olan bütün sekmelerine ulaşır.
  notifyUser(userId: string, event: string, payload: object): void {
    this.server?.to(userChannel(userId)).emit(event, payload);
  }

  //Kişinin bütün socket bağlantılarını keser.
  disconnectUser(userId: string): void {
    this.server?.in(userChannel(userId)).disconnectSockets(true);
  }
}
