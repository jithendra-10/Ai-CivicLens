'use client';

import { SidebarTrigger } from '@/components/ui/sidebar';
import { UserNav } from '@/components/auth/user-nav';
import { useUser, useDoc, useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { User as AppUser } from '@/lib/types';
import { Skeleton } from '../ui/skeleton';

export default function AppHeader() {
  const { user } = useUser();
  const firestore = useFirestore();

  const userDocRef = user ? doc(firestore, 'users', user.uid) : null;
  const { data: appUser, isLoading: isAppUserLoading } = useDoc<AppUser>(userDocRef);

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
      <div className="md:hidden">
        <SidebarTrigger />
      </div>
      <div className="flex w-full items-center justify-end gap-4">
        {isAppUserLoading ? (
           <Skeleton className="h-9 w-9 rounded-full" />
        ) : appUser ? (
           <UserNav user={appUser} />
        ) : null}
      </div>
    </header>
  );
}
