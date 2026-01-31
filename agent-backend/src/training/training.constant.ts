import { IFileTypeConfig } from '@app/common/types/common';

export const TRAINING_MATERIAL_FILE_MAX_ALLOWED_SIZE = 15 * 1024 * 1024; // TODO: External input
export const TRAINING_MATERIAL_ALLOWED_FILE_NUMBER = 5; // TODO: External input

export const VIDEO_FILE_TYPES: IFileTypeConfig[] = [
  { extension: 'mp4', mimeTypes: ['video/mp4'] },
  { extension: 'avi', mimeTypes: ['video/x-msvideo'] },
  { extension: 'mov', mimeTypes: ['video/quicktime'] },
  { extension: 'wmv', mimeTypes: ['video/x-ms-wmv'] },
  { extension: 'flv', mimeTypes: ['video/x-flv'] },
  { extension: 'webm', mimeTypes: ['video/webm'] },
  { extension: 'mkv', mimeTypes: ['video/x-matroska'] },
];

export const TRAINING_MATERIAL_SUPPORTED_FILE_TYPES: IFileTypeConfig[] = [
  {
    extension: 'yaml',
    mimeTypes: ['application/x-yaml', 'text/yaml', 'application/yaml'],
  },
  {
    extension: 'yml',
    mimeTypes: ['application/x-yml', 'text/yml', 'application/yml'],
  },
  {
    extension: 'md',
    mimeTypes: ['text/x-markdown', 'text/markdown'],
  },
  {
    extension: 'json',
    mimeTypes: ['application/json'],
  },
  {
    extension: 'md',
    mimeTypes: ['text/x-markdown', 'text/markdown'],
  },
  {
    extension: 'json',
    mimeTypes: ['application/json'],
  },
  {
    extension: 'pdf',
    mimeTypes: ['application/pdf'],
  },
  ...VIDEO_FILE_TYPES,
];
