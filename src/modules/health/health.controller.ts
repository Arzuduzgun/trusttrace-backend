import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import type { Response } from 'express';
import { RawResponse } from '../../common/decorators/raw-response.decorator';
import { HealthService } from './health.service';
import type { ReadinessReport } from './health.types';

@RawResponse()
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get('live')
  live(): { status: 'ok' } {
    return { status: 'ok' };
  }

  @Get('ready')
  async ready(@Res({ passthrough: true }) res: Response): Promise<ReadinessReport> {
    const report = await this.healthService.checkReadiness();
    res.status(report.status === 'ok' ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE);
    return report;
  }
}
