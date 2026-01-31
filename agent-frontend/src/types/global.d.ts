import React from 'react';

export interface IChildren {
  children: React.ReactNode;
}

export interface IErrorResponse {
  status: 'failure';
  message?: string;
  errorCode?: string;
  timestamp?: string | Date;
  path?: string;
}

export interface ISuccessResponse {
  status: 'success';
  data?: any;
  timestamp: string | Date;
}

type EventActionType = 'new' | 'acknowledged' | 'completed' | 'failed';

type EventContentSourceType = 'user' | 'training';

export interface EventObject {
  eventTypeId: string;
  eventSourceId: string;
  action: EventActionType;
  reference: {
    username: string;
    content: {
      query: string;
      sessionId: string;
    };
    contentSource: EventContentSourceType;
    createdOn: string;
  };
}
