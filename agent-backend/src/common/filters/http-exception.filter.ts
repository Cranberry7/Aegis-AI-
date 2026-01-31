import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  BadRequestException,
  ForbiddenException,
  HttpException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { ERROR_MESSAGES } from '../constants/common.constant';
import { BaseException } from '../classes/base-exception';
import { AppLogger } from '../classes/app-logger';
import { TokenExpiredError } from 'jsonwebtoken';
import { RequestStatus } from '../enums/common.enum';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | object = ERROR_MESSAGES.INTERNAL_SERVER_ERROR;
    let errorCode = ERROR_MESSAGES.UNKNOWN_ERROR;

    // NOTE:
    // Not sure if this should be ignored.
    // Remove this if causes issues with the frontend.
    if (request.url === '/favicon.ico') {
      response.status(204).end();
      return;
    }

    if (exception instanceof HttpException) {
      message = exception.message;
      errorCode = ERROR_MESSAGES.HTTP_ERROR;
      status = exception.getStatus();
    }

    if (exception instanceof ForbiddenException) {
      message = exception?.message;
      errorCode = ERROR_MESSAGES.FORBIDDEN_ACCESS;
      status = HttpStatus.FORBIDDEN;
    }

    if (exception instanceof TokenExpiredError) {
      message = exception?.message;
      errorCode = ERROR_MESSAGES.SESSION_EXPIRED;
      status = HttpStatus.FORBIDDEN;
    }

    if (exception instanceof BaseException) {
      message = exception?.message;
      errorCode = exception?.errorCode;
      status = exception?.statusCode || HttpStatus.BAD_REQUEST;
    }

    if (exception instanceof BadRequestException) {
      const exceptionMessages = (exception?.getResponse() as any)?.message;
      message =
        (exceptionMessages instanceof Array
          ? exceptionMessages[0]
          : exceptionMessages) || exception?.message;
      status = HttpStatus.BAD_REQUEST;
      errorCode = ERROR_MESSAGES.INVALID_INPUT;
    }

    if ((exception as PrismaClientKnownRequestError).code === 'P2002') {
      message = `Duplicate value for unique field: ${(exception as PrismaClientKnownRequestError).meta?.target}`;
      status = HttpStatus.CONFLICT;
      errorCode = ERROR_MESSAGES.DUPLICATE_ENTRY;
    }

    if ((exception as PrismaClientKnownRequestError).code === 'P2025') {
      message = ERROR_MESSAGES.INCORRECT_INFO;
      status = HttpStatus.NOT_ACCEPTABLE;
      errorCode = ERROR_MESSAGES.INVALID_REQUEST;
    }

    if (
      (exception as Prisma.PrismaClientValidationError).name ===
      'PrismaClientValidationError'
    ) {
      message = ERROR_MESSAGES.INCORRECT_INFO;
      status = HttpStatus.NOT_ACCEPTABLE;
      errorCode = ERROR_MESSAGES.INVALID_INPUT;
    }

    AppLogger.logError({ ...(exception as object), errorCode, message });
    response.status(status).json({
      status: RequestStatus.FAILURE,
      message,
      errorCode,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
