export interface Conversations {
  id?: string;
  sessionId: string;
  content: string;
  source: string;
  createdAt: string;
  videoReferences: string;
  feedbackMessage: string;
  feedbackType: string;
  debugSteps?: string[];
}
