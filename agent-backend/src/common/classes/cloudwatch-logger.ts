import { ConfigVariables } from '@app/common/enums/common.enum';
import { AsyncContextService } from '@app/async-context/async-context.service';
import { Injectable, ConsoleLogger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createLogger, Logger as WinstonLogger } from 'winston';
import WinstonCloudWatch from 'winston-cloudwatch';
import { Environments } from '../enums/common.enum';

@Injectable()
export class WinstonCloudWatchLogger extends ConsoleLogger {
  private logger: WinstonLogger;

  constructor(
    private readonly configService: ConfigService,
    private readonly asyncContext: AsyncContextService,
  ) {
    super();

    if (
      this.configService.get<string>(ConfigVariables.ENVIRONMENT) ===
      Environments.PROD
    ) {
      this.logger = createLogger({
        transports: [
          new WinstonCloudWatch({
            logGroupName: this.configService.get<string>(
              ConfigVariables.AWS_CLOUDWATCH_LOGGER_GROUP,
            ),
            logStreamName: `${this.configService.get<string>(
              ConfigVariables.ENVIRONMENT,
            )}-${new Date().toISOString().split('T')[0]}`,
            awsRegion: this.configService.get<string>(
              ConfigVariables.AWS_REGION,
            ),
            awsAccessKeyId: this.configService.get<string>(
              ConfigVariables.AWS_ACCESS_KEY_ID,
            ),
            awsSecretKey: this.configService.get<string>(
              ConfigVariables.AWS_SECRET_ACCESS_KEY,
            ),
            jsonMessage: true,
          }),
        ],
      });
    }
  }

  private getRequestId(): string {
    return this.asyncContext.get<string>('requestId') || 'SYSTEM';
  }

  log(message: string, context?: string) {
    const requestId = this.getRequestId();
    super.log(`[${requestId}] ${message}`, context);
    if (this.logger) {
      this.logger.info({ requestId, message, context });
    }
  }

  error(message: string, trace?: string, context?: string) {
    const requestId = this.getRequestId();
    super.error(`[${requestId}] ${message}`, trace, context);
    if (this.logger) {
      this.logger.error({ requestId, message, trace, context });
    }
  }

  warn(message: string, context?: string) {
    const requestId = this.getRequestId();
    super.warn(`[${requestId}] ${message}`, context);
    if (this.logger) {
      this.logger.warn({ requestId, message, context });
    }
  }
}
