import { UserRoles } from '@app/user/user.enum';
import { IFileTypeConfig } from '../types/common';
import { RequestMethod } from '@nestjs/common';

export const ERROR_MESSAGES = {
  // AWS Module Errors
  S3_DELETION_ERROR: 'S3_DELETION_ERROR',
  S3_UPLOAD_ERROR: 'S3_UPLOAD_ERROR',

  // Processing Module Errors
  MISSING_URL_OR_FILE: 'MISSING_URL_OR_FILE',
  UNSUPPORTED_CONTENT: 'UNSUPPORTED_CONTENT',
  NOT_SUPPORTED_URL: 'NOT_SUPPORTED_URL',
  INVALID_URL: 'INVALID_URL',
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',

  // Auth Module Errors
  INVALID_LOGIN_CREDENTIALS: 'INVALID_LOGIN_CREDENTIALS',
  INVALID_INVITATION_JWT: 'INVALID_INVITATION_JWT',
  ALREADY_VERIFIED_USER: 'ALREADY_VERIFIED_USER',
  NOT_VERIFIED_USER: 'NOT_VERIFIED_USER',
  FAILED_USER_INVITATION: 'FAILED_USER_INVITATION',

  // Communication Module Errors
  FAILED_TO_SEND_EMAIL: 'FAILED_TO_SEND_EMAIL',

  // Account Module Errors
  FAILED_ACCOUNT_UPSERTION: 'FAILED_ACCOUNT_UPSERTION',
  FAILED_ACCOUNT_RETRIEVAL: 'FAILED_ACCOUNT_RETRIEVAL',

  // Document Module Errors
  FAILED_DOCUMENT_UPSERTION: 'FAILED_DOCUMENT_UPSERTION',
  DOCUMENT_DOES_NOT_EXIST: 'DOCUMENT_DOES_NOT_EXIST',
  FAILED_DOCUMENT_RETRIEVAL: 'FAILED_DOCUMENT_RETRIEVAL',

  // User Module Error
  FAILED_USER_UPSERTION: 'FAILED_USER_UPSERTION',
  FAILED_USER_RETRIEVAL: 'FAILED_USER_RETRIEVAL',

  //Event Module Error
  FAILED_UPSERTION: 'FAILED_UPSERTION',

  // Common Generic Errors
  HTTP_ERROR: 'HTTP_ERROR',
  INVALID_TOKEN: 'INVALID_TOKEN',
  INVALID_INPUT: 'INVALID_INPUT',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
  DUPLICATE_ENTRY: 'DUPLICATE_ENTRY',
  INVALID_REQUEST: 'INVALID_REQUEST',
  FORBIDDEN_ACCESS: 'FORBIDDEN_ACCESS',
  SESSION_EXPIRED: 'SESSION_EXPIRED',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  INCOMPLETE_INFO: 'INCOMPLETE_INFORMATION_PROVIDED.',
  INCORRECT_INFO: 'INCORRECT_INFORMATION_PROVIDED',
  AGENT_CONVERSATION_ABSENT: 'AGENT CONVERSATION ABSENT',
  MISSING_INPUT: 'MISSING INPUT',
};

export const DEFAULT_FILE_TYPES: IFileTypeConfig[] = [
  {
    extension: 'jpg',
    mimeTypes: ['image/jpeg'],
  },
  {
    extension: 'jpeg',
    mimeTypes: ['image/jpeg'],
  },
  {
    extension: 'png',
    mimeTypes: ['image/png'],
  },
  {
    extension: 'pdf',
    mimeTypes: ['application/pdf'],
  },
  {
    extension: 'yaml',
    mimeTypes: ['application/x-yaml', 'text/yaml', 'application/yaml'],
  },
  {
    extension: 'yml',
    mimeTypes: ['application/x-yaml', 'text/yaml', 'application/yml'],
  },
  {
    extension: 'md',
    mimeTypes: ['text/x-markdown', 'text/markdown'],
  },
  {
    extension: 'json',
    mimeTypes: ['application/json'],
  },
];

export const SUCCESS_MESSAGES = {
  SUCCESSFUL_DOCUMENT_UPSERTION: 'SUCCESSFUL_DOCUMENT_UPSERTION',
  SUCCESSFUL_ACCOUNT_UPSERTION: 'SUCCESSFUL_ACCOUNT_UPSERTION',
  SUCCESSFUL_USER_UPSERTION: 'SUCCESSFUL_USER_UPSERTION',
  SUCCESSFUL_EMAIL_SENT: 'SUCCESSFUL_EMAIL_SENT',
  SUCCESSFUL_LOGOUT: 'SUCCESSFUL_LOGOUT',
};

export const USERS_MODULE_ROUTES_PERMISSIONS = [
  {
    pathRegex: /^\/users\/?$/,
    method: RequestMethod.GET,
    allowedRoles: [
      UserRoles.USER,
      UserRoles.GUEST,
      UserRoles.ADMIN,
      UserRoles.SUPERADMIN,
    ],
  },
  {
    pathRegex: /^\/users\/?$/,
    method: RequestMethod.POST,
    allowedRoles: [UserRoles.ADMIN, UserRoles.SUPERADMIN],
  },
  {
    pathRegex: /^\/users\/?$/,
    method: RequestMethod.PUT,
    allowedRoles: [UserRoles.ADMIN, UserRoles.SUPERADMIN],
  },
  {
    pathRegex: /^\/users\/:id$/,
    method: RequestMethod.DELETE,
    allowedRoles: [UserRoles.ADMIN, UserRoles.SUPERADMIN],
  },
];

export const ACCOUNT_MODULE_ROUTES_PERMISSIONS = [
  {
    pathRegex: /^\/accounts\/[^/]+$/,
    method: RequestMethod.GET,
    allowedRoles: [
      UserRoles.USER,
      UserRoles.GUEST,
      UserRoles.ADMIN,
      UserRoles.SUPERADMIN,
    ],
  },
  {
    pathRegex: /^\/accounts\/?$/,
    method: RequestMethod.GET,
    allowedRoles: [UserRoles.SUPERADMIN],
  },
  {
    pathRegex: /^\/accounts\/?$/,
    method: RequestMethod.POST,
    allowedRoles: [UserRoles.SUPERADMIN],
  },
];

export const DOCUMENT_MODULE_ROUTES_PERMISSIONS = [
  {
    pathRegex: /^\/documents\/[^/]+$/,
    method: RequestMethod.PUT,
    allowedRoles: [UserRoles.ADMIN, UserRoles.SUPERADMIN],
  },
  {
    pathRegex: /^\/documents\/?$/,
    method: RequestMethod.GET,
    allowedRoles: [UserRoles.ADMIN, UserRoles.SUPERADMIN],
  },
];

export const AUTH_MODULE_ROUTES_PERMISSIONS = [
  {
    pathRegex: /^\/auth\/logout\/?$/,
    method: RequestMethod.POST,
    allowedRoles: [
      UserRoles.USER,
      UserRoles.GUEST,
      UserRoles.ADMIN,
      UserRoles.SUPERADMIN,
    ],
  },
  {
    pathRegex: /^\/auth\/invite\/?$/,
    method: RequestMethod.POST,
    allowedRoles: [UserRoles.ADMIN, UserRoles.SUPERADMIN],
  },
];

export const TRAINING_MODULE_ROUTES_PERMISSIONS = [
  {
    pathRegex: /^\/train\/resources$/,
    method: RequestMethod.POST,
    allowedRoles: [UserRoles.USER, UserRoles.ADMIN, UserRoles.SUPERADMIN],
  },
  {
    pathRegex: /^\/train\/:id$/,
    method: RequestMethod.DELETE,
    allowedRoles: [UserRoles.USER, UserRoles.ADMIN, UserRoles.SUPERADMIN],
  },
];
export const SESSION_MODULE_ROUTES_PERMISSIONS = [
  {
    pathRegex: /^\/sessions\/?$/,
    method: RequestMethod.POST,
    allowedRoles: [UserRoles.USER, UserRoles.ADMIN, UserRoles.SUPERADMIN],
  },
  {
    pathRegex: /^\/sessions\/?$/,
    method: RequestMethod.GET,
    allowedRoles: [UserRoles.USER, UserRoles.ADMIN, UserRoles.SUPERADMIN],
  },
];
export const CONVERSATION_MODULE_ROUTES_PERMISSIONS = [
  {
    pathRegex: /^\/conversations\/?$/,
    method: RequestMethod.POST,
    allowedRoles: [UserRoles.USER, UserRoles.ADMIN, UserRoles.SUPERADMIN],
  },
  {
    pathRegex: /^\/conversations\/?$/,
    method: RequestMethod.GET,
    allowedRoles: [UserRoles.USER, UserRoles.ADMIN, UserRoles.SUPERADMIN],
  },
  {
    pathRegex: /^\/conversations\/?$/,
    method: RequestMethod.PUT,
    allowedRoles: [UserRoles.USER, UserRoles.ADMIN, UserRoles.SUPERADMIN],
  },
];

export const ROLES_PERMISSIONS = [
  ...USERS_MODULE_ROUTES_PERMISSIONS,
  ...AUTH_MODULE_ROUTES_PERMISSIONS,
  ...ACCOUNT_MODULE_ROUTES_PERMISSIONS,
  ...DOCUMENT_MODULE_ROUTES_PERMISSIONS,
  ...TRAINING_MODULE_ROUTES_PERMISSIONS,
  ...SESSION_MODULE_ROUTES_PERMISSIONS,
  ...CONVERSATION_MODULE_ROUTES_PERMISSIONS,
];

export const RequestMethodStringMap: Record<RequestMethod, string> = {
  [RequestMethod.GET]: 'GET',
  [RequestMethod.POST]: 'POST',
  [RequestMethod.PUT]: 'PUT',
  [RequestMethod.DELETE]: 'DELETE',
  [RequestMethod.PATCH]: 'PATCH',
  [RequestMethod.ALL]: 'ALL',
  [RequestMethod.OPTIONS]: 'OPTIONS',
  [RequestMethod.HEAD]: 'HEAD',
  [RequestMethod.SEARCH]: 'SEARCH',
};
