import { Logger } from '@nestjs/common';
import { BaseException } from './base-exception';

export class AppLogger {
  private static logger = new Logger(AppLogger.name);

  static logError(error: any) {
    let errorResponse = error;
    if (error instanceof BaseException) {
      errorResponse = error.getLogDetails();
    }
    this.logger.error(
      `Error Code: ${errorResponse?.errorCode}, Message: ${errorResponse?.message}`,
      errorResponse?.originalStack || errorResponse?.stack,
    );
  }
}
