'use client';

import { SidebarTrigger } from '@/components/ui/sidebar';
import { UserNav } from '@/components/auth/user-nav';
import type { User as AppUser } from '@/lib/types';
import { Skeleton } from '../ui/skeleton';

export default function AppHeader({ user }: { user: AppUser | null }) {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
      <div className="md:hidden">
        <SidebarTrigger />
      </div>
      <div className="flex w-full items-center justify-end gap-4">
        {!user ? (
           <Skeleton className="h-9 w-9 rounded-full" />
        ) : (
           <UserNav user={user} />
        )}
      </div>
    </header>
  );
}
