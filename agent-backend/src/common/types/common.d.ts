import { Request } from 'express';

export interface IFileValidationOptions {
  maxSize?: number;
  supportedFileTypes?: IFileTypeConfig[];
}

export interface IFileTypeConfig {
  extension: string;
  mimeTypes: string[];
}

export interface IAuthenticatedRequest extends Request {
  subject: string;
  scope: string;
  role: string;
  issuer: string;
  accountId: string;
  audience: string;
}

export interface IUploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
  destination?: string;
  filename?: string;
  path?: string;
}

export interface IErrorPayload {
  errorCode: string;
  response?: object;
  message?: string;
  stack?: Error | string;
  statusCode?: number;
}
