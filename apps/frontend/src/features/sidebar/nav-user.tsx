'use client';

import { ChevronsUpDown, LogOut } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { useAuth } from '@frontend/hooks/useAuth';
import { trpc } from '@frontend/utils/trpc';
import { Link } from 'react-router-dom';
import urlJoin from 'url-join';

export function NavUser() {
  const { isMobile } = useSidebar();
  const { userInfo } = useAuth();
  const { data: userPhotoData } = trpc.usos.userPhoto.useQuery();

  const userAvatarUrl = userPhotoData?.photo_urls['50x50'];

  const handleLogout = () => {
    window.location.href = urlJoin(
      import.meta.env.VITE_APP_BASE_URL,
      'rest/auth/logout'
    );
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={userAvatarUrl} alt={userInfo.firstName} />
                <AvatarFallback className="rounded-lg">
                  {userInfo.firstName?.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {userInfo.firstName} {userInfo.lastName}
                </span>
                <span className="truncate text-xs">{userInfo.id}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? 'bottom' : 'top'}
            align="center"
            sideOffset={16}
          >
            <DropdownMenuItem onClick={() => handleLogout()}>
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
