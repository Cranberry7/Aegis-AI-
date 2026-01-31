export interface VideoReference {
  url: string;
  title: string;
  timeRange: [string, string];
  youtubeId?: string;
}

export interface Message {
  id?: string;
  type: string;
  content: string;
  reasoning?: string[];
  videos?: VideoReference[];
  hasRetry?: boolean;
  feedbackType?: string;
  feedbackMessage?: string;
}
