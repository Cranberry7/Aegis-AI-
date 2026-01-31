import { IFileTypeConfig } from '@app/common/types/common';

export const INVITE_USERS_FILE_MAX_ALLOWED_SIZE = 1 * 1024 * 1024; // FIXME: Take this from .env
export const INVITE_USERS_SUPPORTED_FILE_TYPES: IFileTypeConfig[] = [
  {
    extension: 'csv',
    mimeTypes: ['text/csv'],
  },
];
