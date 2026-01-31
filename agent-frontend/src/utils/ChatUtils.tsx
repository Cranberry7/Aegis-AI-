import { defaultMessages } from '@/constants/chatInterface';
import { MessageRole } from '@/enums/message';
import { ScrollArea } from '@radix-ui/react-scroll-area';
import { Message, VideoReference } from '@/types/chatInterface';
import { enqueueSnackbar } from 'notistack';
import { Button } from '@/components/ui/button';
import {
  ChevronDown,
  ChevronUp,
  Copy,
  Play,
  ThumbsUp,
  ThumbsDown,
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { API_ROUTES } from '@/constants/routes';
import { showToast } from '@/components/ShowToast';
import { axiosBackendInstance } from './axiosInstance';
import { FeedBackType, RoleCodes, ToastVariants } from '@/enums/global.enum';
import { useSession } from '@/hooks/useSession';
import { SuggestedQuestionsSection } from '@/components/SuggestedQuestionsSection';
import { useAnimatedText } from '@/hooks/useAnimatedText';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useAuth } from '@/hooks/useAuth';
import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { convertHHMMSSToSeconds } from './global';
import Markdown from '@/components/Markdown';
import { useSidebar } from '@/components/ui/sidebar';
import { useStore } from '@/store/global';

export function AnimatedAgentMessage({ content }: { content: string }) {
  const animated = useAnimatedText(content);
  const { setOpen } = useSidebar();
  const setReferenceUrl = useStore((state) => state.setReferenceUrl);

  function openReference(href: string | null) {
    setReferenceUrl(href);
    setOpen(false);
  }

  return (
    <Markdown
      components={{
        a: ({ href, ...props }) => (
          <a
            className="font-semibold cursor-pointer hover:underline text-base"
            onClick={openReference.bind(null, href ?? null)}
            data-href={href} // storing in data attribute to access it later
            {...props}
          />
        ),
      }}
    >
      {animated}
    </Markdown>
  );
}

function VideoThumbnail({
  title,
  onClick,
  youtubeId,
}: {
  title: string;
  onClick: () => void;
  youtubeId?: string;
}) {
  return (
    <div
      className="relative group cursor-pointer rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 aspect-video"
      onClick={onClick}
      tabIndex={0}
      aria-label={title}
    >
      {youtubeId ? (
        <img
          src={`https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`}
          alt={title}
          className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
        />
      ) : (
        <div className="w-full h-full flex items-center bg-accent justify-center transition-transform duration-300 group-hover:scale-105 overflow-ellipsis ">
          <span className="font-semibold overflow-hidden m-2 text-ellipsis line-clamp-1 xs:line-clamp-2 sm:line-clamp-3 lg:line-clamp-4 break-words text-base sm:text-base">
            {title}
          </span>
        </div>
      )}
      <div className="absolute inset-0 flex items-center justify-center bg-primary/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="w-12 h-12 flex items-center justify-center rounded-full bg-secondary/50 shadow-lg">
          <Play className="h-6 w-6 text-primary" />
        </div>
      </div>
    </div>
  );
}

export function AgentMessage({
  message,
  index,
  handleFeedback,
  isLoading,
  readOnly = false,
}: {
  message: Message;
  index: number;
  handleFeedback: (
    id: string,
    feedbackType: string,
    feedbackMessage?: string,
  ) => void;
  isLoading: boolean;
  readOnly: boolean;
}) {
  const messageRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentVideo, setCurrentVideo] = useState<VideoReference | null>(null);

  function stripStyleAttributes(element: HTMLElement) {
    // Remove inline styles like background-color, color, etc.
    element.querySelectorAll('[style]').forEach((el) => {
      el.removeAttribute('style');
    });

    // Convert onClick handlers to href for hyperlinks
    element.querySelectorAll('a').forEach((link) => {
      const el = link as HTMLElement;
      const hrefValue = el.getAttribute('data-href');
      if (hrefValue) {
        el.setAttribute('href', hrefValue);
        el.removeAttribute('onClick');
      }
    });

    return element.innerHTML;
  }

  const convertToPlainText = (element: HTMLElement): string => {
    let text = '';

    // Handle block elements
    const blockElements = [
      'p',
      'div',
      'pre',
      'code',
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'li',
    ];
    const isBlock = blockElements.includes(element.tagName.toLowerCase());

    // Add newline before block elements
    if (isBlock) text += '\n';

    // Process child nodes
    element.childNodes.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        text += node.textContent;
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const childElement = node as HTMLElement;

        // Handle specific elements
        if (childElement.tagName.toLowerCase() === 'br') {
          text += '\n';
        } else if (childElement.tagName.toLowerCase() === 'pre') {
          text += '\n' + childElement.textContent + '\n';
        } else {
          text += convertToPlainText(childElement);
        }
      }
    });

    // Add newline after block elements
    if (isBlock) text += '\n';

    return text;
  };

  const handleCopy = async (element?: HTMLElement) => {
    if (!messageRef.current) return;

    // Clone the content and remove unwanted styles
    const cloned = messageRef.current.cloneNode(true) as HTMLElement;

    const cleanHtml = stripStyleAttributes(element ?? cloned);
    const plainText = convertToPlainText(element ?? cloned)
      .replace(/\n{3,}/g, '\n\n') // Normalize multiple newlines
      .trim();

    try {
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/html': new Blob([cleanHtml], { type: 'text/html' }),
          'text/plain': new Blob([plainText], { type: 'text/plain' }),
        }),
      ]);
      enqueueSnackbar('Copied to clipboard!');
    } catch (err) {
      console.error('Failed to Copy', err);
    }
  };

  const handleSelectionCopy = async (
    e: React.ClipboardEvent<HTMLDivElement>,
  ) => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;

    const selectedRange = selection.getRangeAt(0);
    const container = messageRef.current;
    if (
      !container ||
      !container.contains(selectedRange.commonAncestorContainer)
    )
      return;

    e.preventDefault();

    const cloned = selectedRange.cloneContents();
    const tempDiv = document.createElement('div');
    tempDiv.appendChild(cloned);

    handleCopy(tempDiv);
  };

  useEffect(() => {
    if (!currentVideo) {
      return;
    }
    const id = requestAnimationFrame(() => {
      // requestAnimationFrame make sure this function runs after DOM render
      if (videoRef.current && currentVideo) {
        const timeInSecs = convertHHMMSSToSeconds(
          currentVideo.timeRange[0] ?? '0',
        );
        videoRef.current.currentTime = timeInSecs;
      }
    });

    return () => cancelAnimationFrame(id);
  }, [currentVideo]);

  return (
    <div
      onCopy={(e) => {
        const selection = window.getSelection();
        if (!selection || selection.isCollapsed) {
          handleCopy();
        } else {
          handleSelectionCopy(e);
        }
      }}
    >
      <div ref={messageRef}>
        {message.type === MessageRole.AGENT ? (
          <AnimatedAgentMessage content={message.content} />
        ) : (
          <Markdown>{String(message.content)}</Markdown>
        )}
      </div>
      {index !== 0 && message.type === MessageRole.AGENT && !isLoading && (
        <>
          {/* Video References */}
          {message.videos && message.videos.length > 0 && (
            <div>
              <p className="mt-4 font-semibold text-xl">Video References:</p>

              <motion.div
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              >
                <AnimatePresence mode="wait">
                  {currentVideo && (
                    <Dialog
                      open={!!currentVideo}
                      onOpenChange={() => setCurrentVideo(null)}
                    >
                      <DialogContent className="!max-w-fit !max-h-fit bg-secondary border gap-0 p-1">
                        <DialogHeader className="p-4 px-6 -mb-6">
                          <DialogTitle>{currentVideo.title}</DialogTitle>
                          <DialogDescription></DialogDescription>
                        </DialogHeader>
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.25 }}
                          className="relative"
                          layoutId={currentVideo.title}
                        >
                          <DialogClose
                            onClick={() => setCurrentVideo(null)}
                          ></DialogClose>
                          {currentVideo.youtubeId ? (
                            <iframe
                              src={`${currentVideo.url}?autoplay=1&start=${convertHHMMSSToSeconds(currentVideo.timeRange[0])}&end=${convertHHMMSSToSeconds(currentVideo.timeRange[1])}`}
                              title="YouTube video"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                              className="aspect-video h-[70vh] rounded-lg bg-black"
                            />
                          ) : (
                            <video
                              ref={videoRef}
                              className="aspect-video h-[70vh] rounded-lg bg-black"
                              controls
                              autoPlay
                            >
                              <source
                                src={currentVideo.url}
                                type="video/mp4"
                              ></source>
                            </video>
                          )}
                        </motion.div>
                      </DialogContent>
                    </Dialog>
                  )}
                  {message.videos.map(
                    (video: VideoReference, index: number) => (
                      <motion.div
                        key={index}
                        layout
                        layoutId={video.title}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.25, delay: index * 0.05 }}
                      >
                        <p className="text-xs pl-1">
                          {video.timeRange[0]} - {video.timeRange[1]}
                        </p>
                        <VideoThumbnail
                          title={video.title}
                          onClick={() => setCurrentVideo(video)}
                          youtubeId={video.youtubeId}
                        />
                      </motion.div>
                    ),
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          )}

          {/* Copy & Feedback buttons */}
          <div className="flex w-full mt-2 gap-2">
            <Button
              onClick={handleCopy.bind(null, undefined)}
              title="Copy"
              variant={'ghost'}
              className="size-7"
            >
              <Copy fontSize="small" />
            </Button>
            <Button
              className="rounded transition-all size-7"
              title="like"
              variant={'ghost'}
              disabled={readOnly}
              onClick={() =>
                handleFeedback(message.id || '', FeedBackType.POSITIVE)
              }
            >
              {message.feedbackType !== FeedBackType.POSITIVE ? (
                <ThumbsUp />
              ) : (
                <ThumbsUp fill="hsl(var(--foreground))" />
              )}
            </Button>

            {/* Thumbs Down */}
            <Button
              className="rounded transition-all size-7"
              title="dislike"
              variant={'ghost'}
              disabled={readOnly}
              onClick={() =>
                handleFeedback(
                  message.id || '',
                  FeedBackType.NEGATIVE,
                  message.feedbackMessage,
                )
              }
            >
              {message.feedbackType != FeedBackType.NEGATIVE ? (
                <ThumbsDown />
              ) : (
                <ThumbsDown fill="hsl(var(--foreground))" />
              )}
            </Button>
          </div>
          {(user.role?.code === RoleCodes.ADMIN ||
            user.role?.code === RoleCodes.SUPERADMIN) &&
            message.feedbackMessage && (
              <div className="flex flex-wrap gap-1 mt-2">
                <b className="text-sm text-muted-foreground">
                  Feedback Comment:
                </b>
                <p className="text-sm">{message.feedbackMessage}</p>
              </div>
            )}
        </>
      )}
    </div>
  );
}

const ReasoningComponent = ({
  initialOpen,
  reasoning,
}: {
  initialOpen: boolean;
  reasoning: string[];
}) => {
  const [open, setOpen] = useState(false);
  if (reasoning && reasoning.length > 0) {
    return (
      <Collapsible open={initialOpen || open} onOpenChange={setOpen}>
        <CollapsibleTrigger className="flex gap-2 items-center cursor-pointer italic text-muted-foreground">
          Steps
          {open ? <ChevronUp /> : <ChevronDown />}
        </CollapsibleTrigger>
        <CollapsibleContent className="p-2 text-sm text-muted-foreground ">
          <ul className="list-none">
            {reasoning?.map((reason, idx) => (
              <li key={idx}>
                <Markdown
                  components={{
                    p: ({ ...props }) => <p {...props} className="text-sm" />,
                    li: ({ ...props }) => (
                      <li
                        {...props}
                        className="pl-2 relative text-muted-foreground"
                      />
                    ),
                    code: ({ ...props }) => (
                      <code
                        {...props}
                        className="bg-muted px-1 py-0.5 rounded text-sm font-semibold font-mono relative"
                      />
                    ),
                  }}
                >
                  {`- ${reason}`}
                </Markdown>
              </li>
            ))}
          </ul>
        </CollapsibleContent>
      </Collapsible>
    );
  } else {
    return <></>;
  }
};

export function GetScrollAreaView({
  isLoading,
  setShowFeedback,
  setFeedback,
  setMessageId,
  suggestedQuestions,
  askSuggestedQuestion,
  readOnly = false,
  handleSendMessage,
}: {
  isLoading?: boolean;
  setShowFeedback?: React.Dispatch<React.SetStateAction<boolean>>;
  setFeedback?: React.Dispatch<React.SetStateAction<string>>;
  setMessageId?: React.Dispatch<React.SetStateAction<string>>;
  suggestedQuestions?: string[] | null;
  askSuggestedQuestion?: (question: string) => void;
  readOnly?: boolean;
  handleSendMessage?: (message: string) => Promise<void>;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const SCROLL_THRESHOLD = 80; // px from bottom to re-enable auto scroll

  const { messages, setMessages } = useSession();

  function retryLastUserMessage(e: any) {
    e.preventDefault();
    const lastUserMessageIndex = [...messages]
      .reverse()
      .findIndex((message) => message.type === MessageRole.USER);

    if (lastUserMessageIndex !== -1) {
      const actualIndex = messages.length - 1 - lastUserMessageIndex;
      const lastUserMessage = messages[actualIndex].content;
      handleSendMessage?.(lastUserMessage);
    }
  }

  const handleFeedback = async (
    id: string,
    feedbackType: string,
    feedbackMessage?: string,
  ) => {
    if (feedbackType == FeedBackType.POSITIVE) {
      // Use functional update to prevent stale closure issues
      setMessages((currentMessages) => {
        const index = currentMessages.findIndex((message) => {
          return message.id === id;
        });

        // If message not found or already has this feedback type, don't update
        if (
          index === -1 ||
          currentMessages[index].feedbackType === feedbackType
        ) {
          return currentMessages;
        }

        return [
          ...currentMessages.slice(0, index),
          {
            ...currentMessages[index],
            feedbackType: feedbackType,
          },
          ...currentMessages.slice(index + 1),
        ];
      });

      showToast({
        message: 'Thanks!',
        variant: ToastVariants.SUCCESS,
      });

      await axiosBackendInstance.put(API_ROUTES.CONVERSATION, {
        id: id,
        feedbackType: feedbackType,
        feedbackMessage: '',
      });
    } else {
      setShowFeedback?.(true);
      setFeedback?.(feedbackMessage ?? '');
    }
    setMessageId?.(id);
  };

  // Track user scroll manually
  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;

    const isAtBottom =
      el.scrollHeight - el.scrollTop - el.clientHeight < SCROLL_THRESHOLD;

    setAutoScroll(isAtBottom);
  };

  // Attach scroll listener
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    el.addEventListener('scroll', handleScroll);
    return () => el.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto-scroll when new messages arrive
  useEffect(() => {
    if (autoScroll && bottomRef.current) {
      requestAnimationFrame(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
      });
    }
  }, [messages, autoScroll]);

  return (
    <ScrollArea
      className="flex-1 overflow-auto py-2 px-10 h-full static w-full smart-word-wrap"
      ref={scrollRef}
    >
      {messages.map(
        (message, index) =>
          (message?.content ||
            (message?.reasoning && message.reasoning.length > 0)) && (
            <div key={message.id}>
              {message.type === MessageRole.SYSTEM ? (
                <div>
                  <span className="font-semibold text-destructive text-sm">
                    Failed to Respond:
                  </span>
                  <div className="border border-destructive text-destructive bg-destructive/10 p-2 px-6 rounded-lg mb-2 flex flex-col items-center text-sm">
                    {message.content}
                  </div>
                  {message.hasRetry && (
                    <div className="flex justify-between ">
                      <span className="text-sm">
                        Try again; Reload the page if issue persists.
                      </span>
                      {index + 1 === messages.length && (
                        <Button onClick={retryLastUserMessage}>Retry</Button>
                      )}
                    </div>
                  )}
                </div>
              ) : message.type === MessageRole.USER ? (
                <div className="bg-primary text-background px-4 py-2 rounded-2xl ml-auto w-fit rounded-tr-xs max-w-full md:max-w-3/4 mb-1">
                  <pre className="whitespace-pre-wrap ">{message.content}</pre>
                </div>
              ) : (
                <div
                  key={index}
                  className={`mb-2 gap-2 flex items-start
                      ${message.type === MessageRole.DEBUG ? 'text-muted-foreground' : ''}`}
                >
                  <div
                    style={{
                      padding: '10px',
                      borderRadius: 16,
                      paddingLeft: 16,
                      paddingRight: 16,
                      borderTopLeftRadius: 4,
                      position: 'relative',
                    }}
                  >
                    {message.reasoning && (
                      <ReasoningComponent
                        initialOpen={message.content <= ''}
                        reasoning={message.reasoning}
                      />
                    )}
                    <AgentMessage
                      message={message}
                      index={index}
                      handleFeedback={handleFeedback}
                      isLoading={isLoading ?? false}
                      readOnly={readOnly}
                    />
                  </div>
                </div>
              )}
            </div>
          ),
      )}
      {!readOnly && !isLoading && (
        <div
          className={`flex flex-1 h-fit w-[90%] ${JSON.stringify(messages) === JSON.stringify(defaultMessages) ? 'absolute bottom-0 justify-center' : 'justify-start'}`}
        >
          <SuggestedQuestionsSection
            suggestedQuestions={suggestedQuestions ?? null}
            askSuggestedQuestion={askSuggestedQuestion}
          />
        </div>
      )}
      {!readOnly && isLoading && (
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-t-1 border-r-1 border-[hsl(var(--primary))] rounded-full animate-spin"></div>
          <p className="italic tracking-wider">🤔 Thinking...</p>
        </div>
      )}
      <div ref={bottomRef} className="h-1" />
    </ScrollArea>
  );
}
