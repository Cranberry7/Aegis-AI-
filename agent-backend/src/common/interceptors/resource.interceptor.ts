import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { IFileValidationOptions, IFileTypeConfig } from '../types/common';
import { Observable } from 'rxjs';
import { IUploadedFile } from '../types/common';
import { DEFAULT_FILE_TYPES } from '../constants/common.constant';
import { formatBytes } from '../utils/file';

@Injectable()
export class FileValidationInterceptor implements NestInterceptor {
  private readonly maxSize: number;
  private readonly supportedFileTypes: IFileTypeConfig[];
  private readonly allowedMimeTypes: string[];
  private readonly allowedExtensions: RegExp;
  private readonly logger = new Logger(FileValidationInterceptor.name);

  constructor(private options: IFileValidationOptions = {}) {
    this.maxSize = options?.maxSize || 5 * 1024 * 1024;
    this.supportedFileTypes = options?.supportedFileTypes || DEFAULT_FILE_TYPES;

    this.allowedMimeTypes = this.supportedFileTypes?.flatMap(
      (type) => type?.mimeTypes,
    );

    const extensionsPattern = this.supportedFileTypes
      .map((type) => type?.extension)
      .join('|');
    this.allowedExtensions = new RegExp(`\\.(${extensionsPattern})$`, 'i');
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const files = (request?.files as IUploadedFile[]) || [];
    if (!files || !Array.isArray(files)) {
      request.files = [];
    } else {
      request.files = files.filter(
        // FIXME: Maybe instead of filtering we should throw an error
        (file) => {
          const isValidSize = file.size <= this.maxSize;
          const isValidType =
            this.allowedMimeTypes.includes(file.mimetype) &&
            this.allowedExtensions.test(file.originalname);

          if (!isValidSize) {
            this.logger.error(
              `File size ${formatBytes(file.size)} exceeds max size ${formatBytes(this.maxSize)}`,
            );
          }
          if (!isValidType) {
            this.logger.error(`Invalid file type ${file.mimetype}`);
          }
          return isValidSize && isValidType;
        }, // TODO: name casing??
      );
    }
    return next.handle();
  }
}
