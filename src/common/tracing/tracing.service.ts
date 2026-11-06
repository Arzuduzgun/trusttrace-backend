import { Injectable, Logger, type OnApplicationShutdown, type OnModuleInit } from '@nestjs/common';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';
import { AppConfigService } from '../../config/app-config.service';
import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';

@Injectable()
export class TracingService implements OnModuleInit, OnApplicationShutdown {
  private readonly logger = new Logger(TracingService.name);
  private provider: NodeTracerProvider | null = null;

  constructor(private readonly config: AppConfigService) {}

  onModuleInit(): void {
    diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.WARN);
    const endpoint = this.config.get('OTEL_EXPORTER_OTLP_ENDPOINT');
    const spanProcessors = endpoint
      ? [new BatchSpanProcessor(new OTLPTraceExporter({ url: `${endpoint}/v1/traces` }))]
      : [];
    this.provider = new NodeTracerProvider({
      resource: resourceFromAttributes({ [ATTR_SERVICE_NAME]: 'trusttrace-backend' }),
      spanProcessors,
    });
    this.provider.register();
    this.logger.log(
      endpoint ? `Tracing exports to ${endpoint}` : 'Tracing active, export disabled',
    );
  }

  async onApplicationShutdown(): Promise<void> {
    await this.provider?.shutdown();
  }
}
