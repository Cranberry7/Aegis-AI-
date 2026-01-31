'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import { SidebarMenuButton } from '@/components/ui/sidebar';
import { IUserProfile } from '@/types/authProvider';
import { convertToKeyword } from '@/utils/global';

export function NavUser({ user }: { user: IUserProfile }) {
  const accountName = user.account?.name || '';
  const keyword = convertToKeyword(accountName);
  return (
    <SidebarMenuButton
      size="lg"
      className="hover:bg-transparent data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
    >
      <Avatar className="h-8 w-8 rounded-lg">
        <AvatarImage src={user.avatar} alt={user.name} />
        <AvatarFallback className="rounded-lg">{keyword}</AvatarFallback>
      </Avatar>
      <div className="grid flex-1 text-left text-sm leading-tight">
        <span className="truncate font-semibold">{user.account?.name}</span>
        <span className="truncate text-xs">Enterprise</span>
      </div>
    </SidebarMenuButton>
  );
}
