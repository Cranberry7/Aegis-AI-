export enum MessageContentType {
  ACTION_PLAN = 'action_plan',
  AI_RESPONSE = 'ai_response',
  APPROVAL = 'approval',
}

export enum MessageRole {
  USER = 'user',
  DEBUG = 'debug',
  AGENT = 'agent_response',
  END = 'end',
  ERROR = 'error',
  SYSTEM = 'system',
  SUGGESTED_QUESTIONS = 'suggested_questions',
  VIDEO_REFERENCE = 'video_reference',
}
