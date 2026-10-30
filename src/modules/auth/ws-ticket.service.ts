import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AppConfigService } from '../../config/app-config.service';
import type { WsTicket } from './auth.types';

const WS_TICKET_TTL_SECONDS = 60;

@Injectable()
export class WsTicketService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly config: AppConfigService,
  ) {}

  //İçinde sadece kullanıcı id’si olan, 60 saniye geçerli bir bilet imzalar.
  async issue(userId: string): Promise<WsTicket> {
    const ticket = await this.jwtService.signAsync(
      { sub: userId },
      { secret: this.config.get('WS_TICKET_SECRET'), expiresIn: WS_TICKET_TTL_SECONDS },
    );
    return { ticket, expiresIn: WS_TICKET_TTL_SECONDS };
  }
  //Bileti kontrol eder. Geçerliyse kullanıcı id’sini döner; süresi dolmuş, sahte ya da bozuksa hata fırlatır.
  async verify(ticket: string): Promise<string> {
    const payload = await this.jwtService.verifyAsync<{ sub: string }>(ticket, {
      secret: this.config.get('WS_TICKET_SECRET'),
      algorithms: ['HS256'],
    });
    return payload.sub;
  }
}
