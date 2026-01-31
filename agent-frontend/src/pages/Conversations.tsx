import { API_ROUTES } from '@/constants/routes';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/DataTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { convertToISTString } from '@/utils/global';
import { DateRange } from 'react-day-picker';
import { DatePickerWithRange } from '@/components/DatePickerWithRange';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { NavigationRoutes } from '@/enums/global.enum';
import { Badge } from '@/components/ui/badge';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { useSession } from '@/hooks/useSession';
import { ExternalLink } from 'lucide-react';

type ConversationsRow = {
  id: string;
  title: string;
  username: string;
  createdAt: string;
  feedbackType: string;
};

type Filters = Partial<
  ConversationsRow & { date: DateRange; feedback: number }
>;

type Feedback = {
  positive: boolean;
  negative: boolean;
};

const ConversationsFilters = ({
  filters,
  setFilters,
}: {
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Partial<ConversationsRow>>>;
}) => {
  return (
    <div className="flex flex-col justify-center w-full items-center py-4 gap-4 md:flex-row">
      <Input
        placeholder="Filter by username / title..."
        value={filters.username ?? ''}
        onChange={(event) =>
          setFilters({
            username: event.target.value,
            title: event.target.value,
          })
        }
        className="max-w-sm"
      />
      <DatePickerWithRange
        className="w-full max-w-sm"
        date={filters.date}
        setDate={(e) =>
          setFilters((prev) => ({ ...prev, date: e ?? undefined }))
        }
      />
      <Select
        defaultValue="0"
        value={filters.feedback?.toString()}
        onValueChange={(value) =>
          setFilters((prev) => ({ ...prev, feedback: parseInt(value) }))
        }
      >
        <SelectTrigger className="flex-1 m-2 w-auto">
          Filter by Feedback:
          <SelectValue />
        </SelectTrigger>
        <SelectContent position="popper">
          <SelectItem value="0">None</SelectItem>
          <SelectItem value="1">Positive</SelectItem>
          <SelectItem value="-1">Negative</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

const Conversations: React.FC = () => {
  const navigate = useNavigate();
  const { setShouldAnimate } = useSession();

  const [filters, setFilters] = useState<Filters>({
    feedback: 0,
    date: {
      from: undefined,
      to: undefined,
    },
  });

  const columns: ColumnDef<ConversationsRow>[] = [
    {
      accessorKey: 'username',
      header: () => 'User Name',
      cell: ({ row }) => {
        const name: string = row.getValue('username');

        if (!filters.username) return <div>{name}</div>;
        const parts = name.split(new RegExp(`(${filters.username})`, 'i'));
        return (
          <div>
            {parts.map((part, i) =>
              part.toLowerCase() === filters.username?.toLowerCase() ? (
                <strong key={i} className="mx-[1px]">
                  {part}
                </strong>
              ) : (
                part
              ),
            )}
          </div>
        );
      },
    },

    {
      accessorKey: 'title',
      header: () => {
        return (
          <div className="flex max-w-[20vw] justify-center ">
            <Button variant="ghost">Title</Button>
          </div>
        );
      },
      cell: ({ row }) => {
        const title: string = row.getValue('title');

        const getTitleElement = () => {
          if (!filters.title)
            return (
              <span className="truncate max-w-[20vw] text-center">{title}</span>
            );

          const parts = title.split(new RegExp(`(${filters.title})`, 'i'));
          return (
            <>
              {parts.map((part, i) =>
                part.toLowerCase() === filters.title?.toLowerCase() ? (
                  <strong key={i} className="mx-[1px]">
                    {part}
                  </strong>
                ) : (
                  <span key={i}>{part}</span>
                ),
              )}
            </>
          );
        };

        return (
          <Tooltip>
            <TooltipTrigger className="truncate max-w-[20vw] text-center">
              {getTitleElement()}
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-center">{title}</div>
            </TooltipContent>
          </Tooltip>
        );
      },
    },

    {
      accessorKey: 'feedback',
      header: () => {
        return (
          <div className="flex w-full justify-center">
            <Button variant="ghost">Feedback Type</Button>
          </div>
        );
      },
      cell: ({ row }) => (
        <div className="flex w-full justify-center gap-1">
          {(row.getValue('feedback') as Feedback).positive && (
            <Badge className="text-green-500 bg-green-100 shadow-md">
              <ThumbsUp />
              Positive
            </Badge>
          )}
          {(row.getValue('feedback') as Feedback).negative && (
            <Badge className="bg-red-100 text-red-500 shadow-md">
              <ThumbsDown />
              Negative
            </Badge>
          )}

          {!(row.getValue('feedback') as Feedback).negative &&
            !(row.getValue('feedback') as Feedback).positive && (
              <Badge className="bg-neutral-50 text-neutral-700 shadow-md">
                None
              </Badge>
            )}
        </div>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: () => {
        return (
          <div className="flex justify-center">
            <Button variant="ghost">Created At</Button>
          </div>
        );
      },
      cell: ({ row }) => (
        <div className="lowercase text-center">
          {convertToISTString(row.getValue('createdAt'))}
        </div>
      ),
    },
    {
      accessorKey: 'id',
      header: () => {
        return (
          <div className="flex justify-center">
            <Button variant="ghost"></Button>
          </div>
        );
      },
      cell: ({ row }) => (
        <div className="flex justify-center shrink">
          <Button
            className="w-8 h-8 bg-transparent hover:bg-accent"
            onClick={() => {
              setShouldAnimate(false);
              navigate(
                `${NavigationRoutes.CONVERSATIONS}/${row.getValue('id')}`,
              );
            }}
          >
            <ExternalLink className="text-blue-400" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-40px)] max-h-[calc(100vh-40px)]">
      <h1 className="text-3xl border-1 text-center p-2">Conversations</h1>
      <div className="flex flex-col items-center flex-1 overflow-y-auto py-2 px-15">
        <ConversationsFilters filters={filters} setFilters={setFilters} />
        {DataTable<ConversationsRow>(
          columns,
          API_ROUTES.SESSIONS.toString(),
          filters,
        )}
      </div>
    </div>
  );
};

export default Conversations;
