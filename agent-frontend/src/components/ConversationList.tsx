'use client';
import React, { useEffect } from 'react';
import InfiniteScroll from '@/components/ui/infinite-scroll';
import { Loader2 } from 'lucide-react';
import { axiosBackendInstance } from '@/utils/axiosInstance';
import { API_ROUTES } from '@/constants/routes';
import { Button } from './ui/button';
import { showToast } from './ShowToast';
import { ToastVariants } from '@/enums/global.enum';
import { CONVERSATION_LIST_LIMIT } from '@/constants/global';
import { cn } from '@/lib/utils';
import { Link, useSearchParams } from 'react-router-dom';
import { useSession } from '@/hooks/useSession';
import { defaultMessages } from '@/constants/chatInterface';
import { format, isToday, isYesterday, parseISO } from 'date-fns';
import { useStore } from '@/store/global';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface Sessions {
  title: string;
  id: string;
  createdAt: string;
}

interface ConversationListProps {
  showFullHeight: boolean;
}

const ConversationList = ({ showFullHeight }: ConversationListProps) => {
  const [page, setPage] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [hasMore, setHasMore] = React.useState(true);
  const [sessions, setSessions] = React.useState<Sessions[]>([]);

  const conversationsReloadKey = useStore(
    (state) => state.conversationsReloadKey,
  );

  const { setMessages, setShouldAnimate } = useSession();
  const [searchParams] = useSearchParams();
  const limit = CONVERSATION_LIST_LIMIT;

  const Session = ({ session }: { session: Sessions }) => {
    const currentSessionId = searchParams.get('sessionId');
    const isActive = currentSessionId === session.id;

    return (
      <Button
        key={session.id}
        variant={'ghost'}
        className={cn(
          'w-full font-normal hover:bg-accent justify-start',
          isActive ? 'bg-muted text-accent-foreground' : '',
        )}
        asChild
      >
        <Link
          to={`/?sessionId=${session.id}`}
          className="w-full"
          onClick={() => {
            if (!isActive) {
              setShouldAnimate(false);
              setMessages([...defaultMessages]);
            }
          }}
        >
          <Tooltip>
            <TooltipTrigger className="w-full overflow-hidden truncate text-left text-sm">
              {session.title}
            </TooltipTrigger>
            <TooltipContent>
              <p>{session.title}</p>
            </TooltipContent>
          </Tooltip>
        </Link>
      </Button>
    );
  };

  useEffect(() => {
    setPage(0);
    setHasMore(true);
    setSessions([]);
  }, [conversationsReloadKey]);

  const next = async () => {
    if (loading || !hasMore) return;

    setLoading(true);

    try {
      const res = await axiosBackendInstance.get(API_ROUTES.SESSIONS, {
        params: {
          skip: page * limit,
          limit: limit,
        },
      });

      const data: Sessions[] = res.data.data;

      if (data.length < limit) setHasMore(false);

      setSessions((prev) => [...prev, ...data]);
      setPage((prev) => prev + 1);
    } catch {
      showToast({
        message: 'Failed to fetch the conversation!',
        variant: ToastVariants.ERROR,
      });
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  const groupByDate = (sessions: Sessions[]) => {
    const grouped: Record<string, Sessions[]> = {};

    sessions.forEach((session) => {
      const date = parseISO(session.createdAt);
      let label = format(date, 'MMMM d, yyyy');
      if (isToday(date)) label = 'Today';
      else if (isYesterday(date)) label = 'Yesterday';

      if (!grouped[label]) grouped[label] = [];
      grouped[label].push(session);
    });

    return grouped;
  };

  const groupedSessions = groupByDate(sessions);

  return (
    <div
      className={cn(
        'w-full overflow-y-auto pl-2',
        showFullHeight ? 'flex-1' : 'h-max-[200px]',
      )}
    >
      <div className="flex w-full flex-col items-center gap-1">
        {Object.entries(groupedSessions).map(([label, group]) => (
          <div key={label} className="w-full">
            <div className="my-2 text-xs font-medium text-muted-foreground text-left ml-3.5">
              {label}
            </div>
            {group.map((session) => (
              <Session key={session.id} session={session} />
            ))}
          </div>
        ))}

        <InfiniteScroll
          hasMore={hasMore}
          isLoading={loading}
          next={next}
          threshold={1}
        >
          {hasMore && <Loader2 className="my-4 h-8 w-8 animate-spin" />}
        </InfiniteScroll>
      </div>
    </div>
  );
};

export default ConversationList;
