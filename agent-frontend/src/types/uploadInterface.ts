import { UploadType } from '@/enums/upload';
import { IDocument } from './document';

export type RowFormat = {
  id: number;
  fileName: string;
  type: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

export type UploadFormData = {
  urls: string[];
  files: File[];
};

export type DocumentResponse = {
  data: IDocument[];
};

export type UploadConfig = {
  batchSize: number;
  acceptedFileTypes: string[];
  maxFileSize: number;
  maxFiles: number;
};

export interface UploadProps {
  onSelect: (type: UploadType.URL | UploadType.FILE | UploadType.MEDIA) => void;
}
