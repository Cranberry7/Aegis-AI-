import { UploadConfig } from '@/types/uploadInterface';

export const UPLOAD_CONFIG: UploadConfig = {
  batchSize: 5,
  acceptedFileTypes: ['.yaml', '.yml', '.md'],
  maxFileSize: 10 * 1024 * 1024, // 10MB
  maxFiles: 10,
};

export const GRID_CONFIG = {
  pageSize: 5,
  pageSizeOptions: [5],
  height: '380px',
  borderRadius: '20px',
};

export const STYLE_CONFIG = {
  dragArea: {
    borderColor: {
      default: '#333',
      active: 'var(hsl(--primary))',
    },
    backgroundColor: {
      default: 'transparent',
      active: '#222',
    },
  },
  grid: {
    borderColor: 'hsl(var(--border))',
    iconColor: '#88888850',
  },
};
