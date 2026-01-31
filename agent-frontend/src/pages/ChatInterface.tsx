import { useState, useEffect, useRef } from 'react';
import { ArrowRight, XIcon } from 'lucide-react';
import { Message } from '@/types/chatInterface';
import { Button } from '@/components/ui/button';
import TextareaAutosize from 'react-textarea-autosize';
import { MessageRole } from '@/enums/message';
import { API_ROUTES } from '@/constants/routes';
import { GetScrollAreaView } from '@/utils/ChatUtils';
import { v4 as uuidv4 } from 'uuid';
import { axiosBackendInstance, axiosCoreInstance } from '@/utils/axiosInstance';
import { defaultMessages } from '@/constants/chatInterface';
import {
  ErrorMessages,
  SuccessMessages,
  ToastVariants,
} from '@/enums/global.enum';

import { showToast } from '@/components/ShowToast';
import { FeedBack } from '@/components/Feedback';
import { FeedBackType } from '@/enums/global.enum';
import { useAuth } from '@/hooks/useAuth';
import { useSession } from '@/hooks/useSession';
import { useSearchParams } from 'react-router-dom';
import { Conversations } from '@/constants/conversations';
import { isAxiosError } from 'axios';
import { HttpStatus } from 'http-status-ts';
import Unauthorised from '@/pages/Unauthorised';
import { ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { useStore } from '@/store/global';
import ReferenceSidebar from '@/components/ReferenceSidebar';

const ChatInterface: React.FC = () => {
  const controller = new AbortController();
  const [inputValue, setInputValue] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [messageId, setMessageId] = useState('');
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[] | null>(
    null,
  ); // null indicates loading state, empty array indicates no suggestions available
  const unauthorised = useStore((state) => state.unauthorised);
  const setUnauthorised = useStore((state) => state.setUnauthorised);

  const { user } = useAuth();

  const {
    messages,
    setMessages,
    sessionIdRef,
    setShouldAnimate,
    fetchSessionData,
  } = useSession();
  const [searchParams, setSearchParams] = useSearchParams();
  const sessionId = searchParams.get('sessionId') || '';

  const isLoading = useStore((state) => state.isLoading);
  const conversationsReloadKey = useStore(
    (state) => state.conversationsReloadKey,
  );
  const setLoading = useStore((state) => state.setLoading);
  const setConversationsReloadKey = useStore(
    (state) => state.setConversationsReloadKey,
  );

  const isNewSession = useRef(false);
  const lastLoadedSessionId = useRef<string | null>(null);

  const addConversationInMessage = (data: Conversations[]) => {
    setMessages((currentMessages) => {
      const newMessages: Message[] = [...currentMessages];

      data?.forEach((item: Conversations) => {
        // Check if message already exists to prevent duplicates
        const existingMessageIndex = newMessages.findIndex(
          (msg) => msg.id === item.id,
        );

        if (existingMessageIndex === -1) {
          newMessages.push({
            id: item.id,
            content: item.content,
            type: item.source,
            videos: JSON.parse(item.videoReferences),
            feedbackType: item.feedbackType,
            feedbackMessage: item.feedbackMessage,
            reasoning: item.debugSteps,
          });
        }
      });

      return newMessages;
    });
  };

  const handleInvalidSession = (error: any) => {
    if (
      isAxiosError(error) &&
      error.response?.status === HttpStatus.FORBIDDEN
    ) {
      setUnauthorised(true);
    } else {
      showToast({
        message: 'Failed to load conversation.',
        variant: ToastVariants.ERROR,
      });
    }
  };

  const handleSessionOpen = async (sessionId: string) => {
    const sessionResponse = await fetchSessionData(
      sessionId,
      handleInvalidSession,
    );

    addConversationInMessage(sessionResponse);
  };

  const setupSession = async (sessionId: string) => {
    const eventSource = new EventSource(
      `${import.meta.env.VITE_AGENT_CORE_BASE_URL}${API_ROUTES.STREAM(
        sessionId,
      )}`,
      {
        withCredentials: true,
      },
    );

    const agentResponse: { [key: string]: string } = {};
    const sessionResponseIdMap: { [key: string]: string } = {};

    eventSource.onmessage = async (event) => {
      const data = JSON.parse(event.data);
      const eventSessionId = data.sessionId;
      const closeEventSource = () => {
        delete agentResponse[eventSessionId];
        delete sessionResponseIdMap[eventSessionId];
        eventSource.close();
        setLoading(false);
      };
      switch (data.type) {
        case MessageRole.AGENT: {
          if (agentResponse[eventSessionId] === undefined) {
            agentResponse[eventSessionId] = '';
            sessionResponseIdMap[eventSessionId] = data.messageId;
          }
          agentResponse[eventSessionId] += data.text;

          setMessages((prev: Message[]) => {
            const lastMsg = prev[prev.length - 1];

            if (
              lastMsg &&
              lastMsg.type === MessageRole.AGENT &&
              eventSessionId === sessionIdRef.current &&
              lastMsg.id === sessionResponseIdMap[eventSessionId]
            ) {
              return [
                ...prev.slice(0, -1),
                {
                  ...lastMsg,
                  content: agentResponse[eventSessionId],
                },
              ];
            }

            if (eventSessionId === sessionIdRef.current) {
              return [
                ...prev,
                {
                  id: sessionResponseIdMap[eventSessionId],
                  type: MessageRole.AGENT,
                  content: agentResponse[eventSessionId],
                },
              ];
            }

            return prev;
          });
          break;
        }
        case MessageRole.DEBUG: {
          if (eventSessionId === sessionIdRef.current) {
            const agentMessageId = data.messageId;
            setMessages((prev: Message[]) => {
              return prev.map((message) => {
                if (message.id === agentMessageId) {
                  return {
                    ...message,
                    reasoning: (message.reasoning ?? []).concat(data.text),
                  };
                }
                return message;
              });
            });
          }
          break;
        }
        case MessageRole.VIDEO_REFERENCE: {
          if (eventSessionId === sessionIdRef.current) {
            const agentMessageId = data.messageId;
            setMessages((prev: Message[]) => {
              return prev.map((message) => {
                const newVideoReferences = (message.videos ?? []).concat(
                  JSON.parse(data.text),
                );

                if (message.id === agentMessageId) {
                  return {
                    ...message,
                    videos: newVideoReferences,
                  };
                }
                return message;
              });
            });
          }
          break;
        }
        case MessageRole.SUGGESTED_QUESTIONS: {
          if (eventSessionId === sessionIdRef.current) {
            setSuggestedQuestions((prev) => {
              return [...(prev ?? []), data.text];
            });
          }
          break;
        }
        case MessageRole.ERROR: {
          setMessages((prev: Message[]) => [
            ...prev,
            {
              id: uuidv4(),
              type: MessageRole.SYSTEM,
              content: data.text,
              hasRetry: true,
            },
          ]);
          closeEventSource();
          break;
        }
        case MessageRole.END: {
          closeEventSource();
          setConversationsReloadKey(conversationsReloadKey + 1);
          break;
        }
        default:
          break;
      }
    };

    return eventSource;
  };

  const addFeedback = async (id: string, feedback: string) => {
    try {
      setMessages((currentMessages) => {
        const index = currentMessages.findIndex((message) => {
          return message.id === id;
        });

        if (index === -1) {
          return currentMessages;
        }

        return [
          ...currentMessages.slice(0, index),
          {
            ...currentMessages[index],
            feedbackType: FeedBackType.NEGATIVE,
            feedbackMessage: feedback,
          },
          ...currentMessages.slice(index + 1),
        ];
      });

      await axiosBackendInstance.put(API_ROUTES.CONVERSATION, {
        id: id,
        feedbackType: FeedBackType.NEGATIVE,
        feedbackMessage: feedback,
      });
      setFeedback('');
      setShowFeedback(false);
      showToast({
        message: SuccessMessages.FEEDBACK_RECORDED,
        variant: ToastVariants.SUCCESS,
      });
    } catch {
      showToast({
        message: ErrorMessages.FEEDBACK_NOT_RECORDED,
        variant: ToastVariants.ERROR,
      });
    }
  };

  const askSuggestedQuestion = (question: string) => {
    setInputValue('');
    handleSendMessage(question);
  };

  const handleSendMessage = async (message: string) => {
    if (message.trim() === '' || isLoading) return;

    let currentSessionId = sessionId;
    let currentMessages = messages;
    setShouldAnimate(true);

    if (!currentSessionId) {
      currentSessionId = uuidv4();
      setSearchParams((prev) => ({ ...prev, sessionId: currentSessionId }));
      isNewSession.current = true;
      await axiosBackendInstance.post(API_ROUTES.SESSIONS, {
        id: currentSessionId,
        title: message,
        userId: user.id ?? '',
      });
    }
    const session = await setupSession(currentSessionId);
    if (session) {
      setInputValue('');
      setLoading(true);
      setSuggestedQuestions([]);
      const userMessageId = uuidv4();
      currentMessages = [
        ...messages,
        { id: userMessageId, type: MessageRole.USER, content: message },
      ];
      setMessages(currentMessages);
      try {
        await axiosCoreInstance.post(API_ROUTES.CHAT, {
          query: message,
          sessionId: currentSessionId,
          userId: user.id,
        });
      } catch (error) {
        if (
          isAxiosError(error) &&
          error.response?.status === HttpStatus.TOO_MANY_REQUESTS
        ) {
          showToast({
            message: ErrorMessages.RATE_LIMIT_EXCEEDED,
            variant: ToastVariants.ERROR,
          });
        } else {
          const systemMessageId = uuidv4();
          setMessages((prev) => [
            ...prev,
            {
              id: systemMessageId,
              type: MessageRole.SYSTEM,
              content: ErrorMessages.RESPONSE_NOT_RECEIVED,
              hasRetry: true,
            },
          ]);
        }
        setLoading(false);
        session.close();
      }
    }
  };

  useEffect(() => {
    sessionIdRef.current = sessionId;
    setSuggestedQuestions([]);

    // Only load session if:
    // 1. sessionId exists
    // 2. It's not a new session we just created
    // 3. We haven't already loaded this session
    // 4. The sessionId actually changed (not just a re-render)
    if (
      sessionId &&
      !isNewSession.current &&
      lastLoadedSessionId.current !== sessionId
    ) {
      // Reset messages to default before loading new session to prevent duplicates
      if (lastLoadedSessionId.current !== null) {
        setMessages([...defaultMessages]);
      }
      handleSessionOpen(sessionId);
      lastLoadedSessionId.current = sessionId;
    }

    if (isNewSession.current) {
      isNewSession.current = false;
    }
  }, [sessionId]);

  return unauthorised ? (
    <Unauthorised />
  ) : (
    <div
      className="flex relative h-full w-full"
      style={{
        height: 'calc(100vh - 40px )',
        maxHeight: 'calc(100vh - 40px )',
        overflow: 'hidden',
      }}
    >
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel minSize={20}>
          <div className="flex flex-col relative justify-end flex-1 h-full w-full">
            <GetScrollAreaView
              isLoading={isLoading}
              setShowFeedback={setShowFeedback}
              setFeedback={setFeedback}
              setMessageId={setMessageId}
              suggestedQuestions={suggestedQuestions}
              askSuggestedQuestion={askSuggestedQuestion}
              handleSendMessage={handleSendMessage}
            />
            <div className="flex border-2 m-4 p-2 pl-4 mb-8 rounded-2xl items-center self-center w-[90%] md:w-[60%] bg-[#ffffff15]">
              <TextareaAutosize
                placeholder="Type your message..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={async (e) => {
                  if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey) {
                    e.preventDefault();
                    await handleSendMessage(inputValue);
                  }
                }}
                minRows={1}
                maxRows={4}
                style={{
                  background: 'none',
                  outline: 'none',
                  border: 'none',
                  resize: 'none',
                  width: '100%',
                }}
              />
              {isLoading ? (
                <Button
                  variant="default"
                  color="primary"
                  onClick={() => controller.abort()}
                  style={{
                    marginLeft: '10px',
                    borderRadius: '30px',
                  }}
                >
                  <XIcon strokeWidth={4} />
                </Button>
              ) : (
                <Button
                  variant="default"
                  onClick={async () => {
                    await handleSendMessage(inputValue);
                  }}
                  className="rounded-3xl self-end"
                  style={{
                    padding: 20,
                  }}
                >
                  <ArrowRight strokeWidth={4} color="hsl(var(--background))" />
                </Button>
              )}
            </div>
          </div>
        </ResizablePanel>
        {/* Sidebar for showing references */}

        <ReferenceSidebar />
      </ResizablePanelGroup>

      {/* Feedback message popup  */}
      {showFeedback && (
        <FeedBack
          feedback={feedback}
          setFeedback={setFeedback}
          setShowFeedback={setShowFeedback}
          addFeedback={addFeedback}
          messageId={messageId}
        />
      )}
    </div>
  );
};
export default ChatInterface;
