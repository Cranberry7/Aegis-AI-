import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { GetScrollAreaView } from '@/utils/ChatUtils';
import { useSession } from '@/hooks/useSession';
import { Message } from '@/types/chatInterface';
import Unauthorised from '@/pages/Unauthorised';
import { ResizablePanel, ResizablePanelGroup } from './ui/resizable';
import ReferenceSidebar from './ReferenceSidebar';
import { isAxiosError } from 'axios';
import { HttpStatus } from 'http-status-ts';
import { useStore } from '@/store/global';

export const ReadOnlyConversations: React.FC = () => {
  const { setMessages, fetchSessionData } = useSession();
  const { sessionId } = useParams<{ sessionId: string }>();
  const unauthorised = useStore((state) => state.unauthorised);
  const setUnauthorised = useStore((state) => state.setUnauthorised);

  function handleInvalidSession(error: any) {
    if (
      isAxiosError(error) &&
      error.response?.status === HttpStatus.FORBIDDEN
    ) {
      setUnauthorised(true);
    }
  }

  async function handleSessionData(sessionId: string) {
    const result = await fetchSessionData(sessionId, handleInvalidSession);

    if (result) {
      setMessages(
        result.map(
          (message: any): Message => ({
            id: message.id,
            content: message.content,
            type: message.source,
            videos: JSON.parse(message.videoReferences),
            feedbackType: message.feedbackType,
            feedbackMessage: message.feedbackMessage,
            reasoning: message.debugSteps,
          }),
        ),
      );
    }
  }

  useEffect(() => {
    if (sessionId) {
      handleSessionData(sessionId);
    }
  }, [sessionId]);

  return unauthorised ? (
    <Unauthorised />
  ) : (
    <div
      className="flex flex-row relative h-full w-full py-5"
      style={{
        height: 'calc(100vh - 40px)',
        maxHeight: 'calc(100vh - 40px)',
        overflow: 'hidden',
      }}
    >
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel minSize={20}>
          {sessionId && <GetScrollAreaView readOnly={true} />}
        </ResizablePanel>
        <ReferenceSidebar />
      </ResizablePanelGroup>
    </div>
  );
};
