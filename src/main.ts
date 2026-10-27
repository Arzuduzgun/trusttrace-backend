import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ERROR_REGISTRY } from './common/errors/error-registry';
import { validationExceptionFactory } from './common/validation/validation-exception.factory';
import { AppConfigService } from './config/app-config.service';
import { Logger as PinoLogger } from 'nestjs-pino';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(PinoLogger));
  const config = app.get(AppConfigService);

  app.setGlobalPrefix('api/v1', { exclude: ['health/live', 'health/ready'] });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: false },
      exceptionFactory: validationExceptionFactory,
    }),
  );

  await app.listen(config.get('PORT'));
  new Logger('Bootstrap').log(`${ERROR_REGISTRY.size} error codes registered`);
}

void bootstrap();
