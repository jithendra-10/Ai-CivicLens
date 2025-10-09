'use client';

import { SidebarTrigger } from '@/components/ui/sidebar';
import { UserNav } from '@/components/auth/user-nav';
import { useUser } from '@/firebase';

export default function AppHeader() {
  const { user } = useUser();

  const appUser = user ? {
    uid: user.uid,
    fullName: user.displayName || user.email || 'Anonymous',
    email: user.email || 'Not available',
    role: user.isAnonymous ? 'citizen' : 'authority' as 'citizen' | 'authority',
  } : null;

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
      <div className="md:hidden">
        <SidebarTrigger />
      </div>
      <div className="flex w-full items-center justify-end gap-4">
        {appUser && <UserNav user={appUser} />}
      </div>
    </header>
  );
}
