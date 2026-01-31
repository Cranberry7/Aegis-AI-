export enum SupportedResourceTypes {
  FILE = 'file',
  URL = 'url',
  MEDIA = 'media',
}

export enum DocumentProcessingPurpose {
  TRAINING = 'training',
}

export enum TrainingDataActions {
  NEW = 'new',
  DELETE = 'delete',
}

export enum TrainingActionStatus {
  COMPLETED = 'completed',
  FAILED = 'failed',
}
