import { IErrorPayload } from '../types/common';

export class BaseException extends Error {
  public readonly errorCode: string = undefined;

  // TODO: Need an upgrade
  // TODO: Use status code while throwing an error
  // TODO: Attach status codes with constants
  public readonly statusCode: number = undefined;
  public readonly originalStack?: string | Error = undefined;

  constructor(errorPayload: IErrorPayload) {
    const { errorCode, message, stack, statusCode } = errorPayload;

    super(message);
    this.errorCode = errorCode;
    this.statusCode = statusCode;

    Object.setPrototypeOf(this, new.target.prototype);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, BaseException);
    }

    this.originalStack = stack || this.stack;
  }

  public getLogDetails(): Record<string, any> {
    return {
      errorCode: this.errorCode,
      message: this.message,
      stack: this.stack,
      statusCode: this.statusCode,
      originalStack: this.originalStack,
    };
  }
}
