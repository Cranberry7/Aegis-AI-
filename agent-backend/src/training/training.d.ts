import { TrainingDataActions } from './training.enum';

interface IUrlMetadata {
  url?: string;
  sourceId?: string;
}

interface IFileMetadata {
  originalName?: string;
  mimetype?: string;
  size?: number;
  sourceId?: string;
  folder?: string;
}

interface TrainingDataContent {
  resourceType: string;
  metadata: IFileMetadata | IUrlMetadata;
}

export interface ITrainingData {
  content: Array[TrainingDataContent];
  action: TrainingDataActions;
}

export interface ITrainingDeleteEvent {
  documentId: string;
}
