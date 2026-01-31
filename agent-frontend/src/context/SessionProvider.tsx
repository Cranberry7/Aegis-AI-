import { useRef, useState } from 'react';
import { SessionContext } from './SessionContext';
import { defaultMessages } from '@/constants/chatInterface';
import { Message } from '@/types/chatInterface';
import { axiosBackendInstance } from '@/utils/axiosInstance';
import { API_ROUTES } from '@/constants/routes';

export const SessionProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [messages, setMessages] = useState<Message[]>([...defaultMessages]);
  const [shouldAnimate, setShouldAnimate] = useState(true);
  const sessionIdRef = useRef('');

  async function fetchSessionData(
    sessionId: string,
    failedCallback: (error: any) => void,
  ) {
    try {
      const response = await axiosBackendInstance.get(API_ROUTES.CONVERSATION, {
        params: {
          sessionId: sessionId,
        },
      });
      return response.data.data;
    } catch (error) {
      failedCallback(error);
    }
  }

  return (
    <SessionContext.Provider
      value={{
        messages,
        setMessages,
        sessionIdRef,
        shouldAnimate,
        setShouldAnimate,
        fetchSessionData,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};
