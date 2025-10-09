'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
} from '@/components/ui/sidebar';
import SidebarNavigation from '@/components/layout/sidebar-nav';
import AppHeader from '@/components/layout/header';
import { useUser, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { User as AppUser } from '@/lib/types';
import Loading from '@/app/loading';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const firestore = useFirestore();

  const userDocRef = useMemoFirebase(
    () => (user && firestore ? doc(firestore, 'users', user.uid) : null),
    [user, firestore]
  );
  
  const { data: appUser, isLoading: isAppUserLoading } =
    useDoc<AppUser>(userDocRef);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [isUserLoading, user, router]);

  useEffect(() => {
    if (appUser) {
      if (appUser.role === 'citizen' && pathname.startsWith('/dashboard')) {
        router.replace('/report');
      }
      if (appUser.role === 'authority' && pathname.startsWith('/report')) {
        router.replace('/dashboard');
      }
    }
  }, [appUser, pathname, router]);

  if (isUserLoading || (user && isAppUserLoading) || (user && !appUser)) {
    return <Loading />;
  }

  if (!user) {
    // This can happen briefly during the redirect. Showing a loader is better than a flash of content.
    return <Loading />;
  }

  // Only render the layout if we have the appUser
  if (appUser) {
    return (
      <SidebarProvider>
        <Sidebar>
          <SidebarNavigation user={appUser} />
        </Sidebar>
        <SidebarInset>
          <AppHeader />
          <main className="p-4 sm:p-6 lg:p-8">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    );
  }
  
  // Fallback, in case something unexpected happens
  return <Loading />;
}
