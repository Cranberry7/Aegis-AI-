import { defaultMessages } from '@/constants/chatInterface';
import { Message } from '@/types/chatInterface';
import { createContext } from 'react';

interface ISessionContext {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  sessionIdRef: React.MutableRefObject<string>;
  shouldAnimate: boolean;
  setShouldAnimate: React.Dispatch<React.SetStateAction<boolean>>;
  fetchSessionData: (
    sessionId: string,
    failedCallback: (error: any) => void,
  ) => Promise<any>;
}

export const SessionContext = createContext<ISessionContext>({
  messages: [...defaultMessages],
  sessionIdRef: { current: '' },
  setMessages: () => {},
  shouldAnimate: true,
  setShouldAnimate: () => {},
  fetchSessionData: () => Promise.resolve(undefined),
});
