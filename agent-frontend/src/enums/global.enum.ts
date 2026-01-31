export enum GlobalNames {
  APP_NAME = 'sarvaha.ai',
}

export enum ErrorMessages {
  // Auth
  INVALID_LOGIN_CREDENTIALS = 'Invalid Login Credentials!',
  NOT_VERIFIED_USER = 'Please verify your email before logging in!',
  USER_SESSION_EXPIRED = 'Session Expired! Please login again.',
  RESPONSE_NOT_RECEIVED = 'Failed to receive response',

  // Common
  UNKNOWN_ERROR = "It's not you, it's us! Something went wrong on our end.",
  SUBMISSION_ERROR = 'Submission Error',
  RATE_LIMIT_EXCEEDED = 'Rate limit exceeded! Please try again in some time.',

  // File
  FILE_NOT_SUBMITTED = 'Error submitting files. Please try again.',
  AT_LEAST_ONE_FILE = 'Please provide at least one file.',

  //URL
  URL_NOT_SUBMITTED = 'Error submitting URLs. Please try again.',
  AT_LEAST_ONE_URL = 'Please provide at least one URL.',

  //Media
  MEDIA_NOT_SUBMITTED = 'Error submitting medias. Please try again.',
  AT_LEAST_ONE_MEDIA = 'Please provide at least one media.',

  //feedback
  FEEDBACK_NOT_RECORDED = 'Failed to record your feedback!',

  //conversation
  CONVERSATION_NOT_SAVED = 'Failed to save the conversation!',

  //user
  FAILURE_INVITING_USER = 'Failed to invite the User!',
  DELETE_USER_FAILED = 'Failed to delete the User!',

  //document
  DELETE_DOCUMENT_FAILED = 'Failed to delete the document!',

  //suggestion question
  SUGGESTED_QUESTION_NOT_RECEIVED = 'Failed to receive suggestion questions!',
}

export enum SuccessMessages {
  // Auth
  LOGIN_SUCCESSFULL = 'Login Successful! Welcome back.',
  LOGOUT_SUCCESSFULL = 'Logout Successful! Visit again.',

  // File
  FILE_SUBMITTED = 'Files submitted successfully!',

  //URL
  URL_SUBMITTED = 'URLs submitted successfully!',

  //Media
  MEDIA_SUBMITTED = 'Medias submitted successfully!',

  //feedback
  FEEDBACK_RECORDED = 'Thanks for the feedback!',

  //User
  INVITE_SENT_SUCCESSFULLY = 'Invite sent successfully!',
  USER_DELETED = 'User(s) deleted successfully!',

  //document
  DOCUMENT_DELETED = 'Document(s) deleted successfully!',
}

export enum FeedBackType {
  POSITIVE = 'positive',
  NEGATIVE = 'negative',
}

export enum ToastVariants {
  SUCCESS = 'success',
  ERROR = 'error',
  INFO = 'info',
  WARNING = 'warning',
}

export enum RoleCodes {
  ADMIN = 'admin',
  SUPERADMIN = 'superadmin',
  USER = 'user',
  GUEST = 'guest',
}

export enum NavigationRoutes {
  HISTORY = '/history',
  CONVERSATIONS = '/conversations',
  USERS = '/users',
  TRAIN = '/train',
  LOGIN = '/login',
  REFERENCES = '/references',
}
