import { NestFactory } from '@nestjs/core';
import { AppModule } from '@app/app.module';
import { ConfigService } from '@nestjs/config';
import { ConfigVariables } from '@app/common/enums/common.enum';
import { Environments } from '@app/common/enums/common.enum';
import { ResponseInterceptor } from '@app/common/interceptors/response.interceptor';
import { HttpExceptionFilter } from '@app/common/filters/http-exception.filter';
import { ValidationPipe } from '@nestjs/common/pipes/validation.pipe';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { WinstonCloudWatchLogger } from './common/classes/cloudwatch-logger';
import { getRabbitMQMicroserviceConfig } from './config/rabbit.config';
import { apiReference } from '@scalar/nestjs-api-reference';
import { readFileSync } from 'fs';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Set global prefix
  app.setGlobalPrefix('agent-backend/');
  app.use(cookieParser());
  app.use(
    cors({
      origin: configService.get<string>(ConfigVariables.FRONTEND_BASE_URL),
      credentials: true,
      allowedHeaders: ['Content-Type', 'Authorization'],
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
    }),
  );
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // Logger
  const appLogger = app.get(WinstonCloudWatchLogger);
  app.useLogger(appLogger);

  app.connectMicroservice(getRabbitMQMicroserviceConfig(configService));
  const port = configService.get<number>(ConfigVariables.BACKEND_PORT);

  await app.startAllMicroservices();
  const openApiPath = join(__dirname, '..', 'openapi.json');

  app.use('/openapi.json', (req, res) => {
    const jsonData = readFileSync(openApiPath, 'utf8');
    res.setHeader('Content-Type', 'application/json');
    res.send(jsonData);
  });

  app.use(
    '/agent-backend/docs',
    apiReference({
      url:
        configService.get<string>(ConfigVariables.ENVIRONMENT) ===
        Environments.PROD
          ? '/agent-backend/openapi.json'
          : '/openapi.json',
      title: 'AI Agent Backend API Documentation',
      hideClientButton: true,
      favicon: 'https://zeno.sarvaha.ai/assets/sarvaha-logo.png',
    }),
  );
  await app.listen(port);
}

bootstrap();
