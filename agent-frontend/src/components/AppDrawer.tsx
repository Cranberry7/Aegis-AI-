import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
} from '@/components/ui/sidebar';
import { NavUser } from './sidebar/nav-user';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import {
  Menu,
  Settings,
  LogOut,
  Upload,
  ChevronDown,
  ChevronRight,
  History,
  User,
  MessagesSquare,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { convertToKeyword } from '@/utils/global';
import { NavigationRoutes, RoleCodes } from '@/enums/global.enum';
import ConversationList from './ConversationList';
import { useSession } from '@/hooks/useSession';
import { defaultMessages } from '@/constants/chatInterface';
import { useStore } from '@/store/global';

const AppDrawer: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isTrainingOpen, setIsTrainingOpen] = useState(false);
  const [isConversationOpen, setIsConversationOpen] = useState(false);

  const { setMessages, setShouldAnimate } = useSession();
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const setLoading = useStore((state) => state.setLoading);
  const setShowSettings = useStore((state) => state.setShowSettings);

  const createNewChat = () => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('sessionId');
    setSearchParams(newParams);

    setShouldAnimate(true);
    if (location.pathname === '/') {
      setLoading(false);
    } else {
      navigate('/');
    }
    setMessages(defaultMessages);
  };

  return (
    <Sidebar className="duration-300 bg-background">
      <SidebarHeader>
        <div className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground flex gap-2 items-center justify-center p-2 relative">
          <Avatar className="h-8 w-8 rounded-lg shrink-0">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="rounded-lg">
              {convertToKeyword(user.name || RoleCodes.USER)}
            </AvatarFallback>
          </Avatar>
          <div className="grid flex-1 text-left text-sm leading-tight min-w-0">
            <span className="truncate font-semibold">{user.name}</span>
            <span className="truncate text-xs">{user.email}</span>
          </div>
          <div className="relative">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 p-0 transition-colors"
                >
                  <Menu className="size-4 shrink-0" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-40 rounded-lg z-[9999] bg-background border border-border shadow-md"
                side="bottom"
                align="start"
                sideOffset={8}
                forceMount
              >
                <DropdownMenuItem
                  className="cursor-pointer "
                  onClick={() => setShowSettings(true)}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer "
                  onClick={() => {
                    setLoading(false);
                    logout();
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="overflow-hidden">
        <SidebarGroup className="flex flex-col h-full">
          {/* Training Section */}
          <div className="w-full mb-2 flex-1 overflow-auto flex flex-col gap-1">
            {(user.role?.code === RoleCodes.ADMIN ||
              user.role?.code === RoleCodes.SUPERADMIN) && (
              <>
                <Button
                  variant="ghost"
                  className="flex w-full items-center justify-between p-2 rounded-md hover:bg-accent cursor-pointer"
                  onClick={() => navigate(NavigationRoutes.CONVERSATIONS)}
                >
                  <div className="flex items-center gap-2">
                    <MessagesSquare className="h-4 w-4" />
                    <span>Conversations</span>
                  </div>
                </Button>
                <Button
                  variant="ghost"
                  className="flex w-full items-center justify-between p-2 rounded-md hover:bg-accent cursor-pointer"
                  onClick={() => navigate(NavigationRoutes.USERS)}
                >
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>Manage Users</span>
                  </div>
                </Button>
              </>
            )}
            {user.role?.code === RoleCodes.USER && (
              <>
                <Button
                  variant="ghost"
                  className="flex w-full items-center justify-between p-2 rounded-md hover:bg-accent cursor-pointer"
                  onClick={() => setIsConversationOpen(!isConversationOpen)}
                >
                  <div className="flex items-center gap-2">
                    <MessagesSquare className="h-4 w-4" />
                    <span>Conversations</span>
                  </div>
                  {isConversationOpen ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
                {isConversationOpen && (
                  <div className="space-y-1 flex-1 overflow-auto p-2">
                    <ConversationList
                      showFullHeight={user.role?.code === RoleCodes.USER}
                    />
                  </div>
                )}
              </>
            )}
            {user.role?.code !== RoleCodes.USER && (
              <div>
                <Button
                  variant="ghost"
                  className="flex w-full items-center justify-between p-2 rounded-md hover:bg-accent cursor-pointer"
                  onClick={() => setIsTrainingOpen(!isTrainingOpen)}
                >
                  <div className="flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    <span>Training</span>
                  </div>
                  {isTrainingOpen ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
                {/* Training Sub-options */}
                {isTrainingOpen && (
                  <div className="pl-6 mt-1 space-y-1">
                    <Button
                      variant="ghost"
                      className="flex items-center justify-start gap-2 p-2 rounded-md hover:bg-accent cursor-pointer w-full"
                      onClick={() => navigate(NavigationRoutes.TRAIN)}
                    >
                      <Upload className="h-4 w-4" />
                      <span>Train</span>
                    </Button>
                    <Button
                      variant="ghost"
                      className="flex items-center justify-start gap-2 p-2 rounded-md hover:bg-accent cursor-pointer w-full"
                      onClick={() => navigate(NavigationRoutes.HISTORY)}
                    >
                      <History className="h-4 w-4" />
                      <span>History</span>
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>

          <Button className="w-full cursor-pointer" onClick={createNewChat}>
            New Chat
          </Button>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="overflow-hidden">
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppDrawer;
