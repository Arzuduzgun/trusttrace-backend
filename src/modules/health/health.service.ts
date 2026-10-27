import { Injectable, Logger } from '@nestjs/common';
import { HealthRepository } from './health.repository';
import type { DependencyState, ReadinessReport } from './health.types';

const CHECK_TIMEOUT_MS = 2000;

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);

  constructor(private readonly healthRepository: HealthRepository) {}

  async checkReadiness(): Promise<ReadinessReport> {
    const checks = {
      database: await this.runCheck('database', () => this.healthRepository.pingDatabase()),
    };
    const isReady = Object.values(checks).every((state) => state === 'up');
    return { status: isReady ? 'ok' : 'unavailable', checks };
  }

  private async runCheck(name: string, check: () => Promise<boolean>): Promise<DependencyState> {
    const timeout = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error(`${name} check timed out`)), CHECK_TIMEOUT_MS);
    });
    try {
      await Promise.race([check(), timeout]);
      return 'up';
    } catch (error) {
      this.logger.warn(`${name} is down: ${error instanceof Error ? error.message : String(error)}`);
      return 'down';
    }
  }
}