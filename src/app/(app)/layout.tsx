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
      // If the user is on the root path, redirect them to their correct dashboard.
      if (pathname === '/') {
        if (appUser.role === 'citizen') {
          router.replace('/dashboard');
        } else if (appUser.role === 'authority') {
          router.replace('/authority');
        }
      }
      // Enforce role-based access to routes.
      else if (appUser.role === 'citizen' && pathname.startsWith('/authority')) {
        router.replace('/dashboard');
      } else if (appUser.role === 'authority' && !pathname.startsWith('/authority')) {
        router.replace('/authority');
      }
    }
  }, [appUser, pathname, router]);

  if (isUserLoading || (user && isAppUserLoading) || (user && !appUser)) {
    return <Loading />;
  }

  if (!user || !appUser) {
    // This can happen briefly during the redirect or if data is missing.
    // Showing a loader is better than a flash of content or an error.
    return <Loading />;
  }

  // At this point, we have a logged-in user and their app-specific data.
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarNavigation user={appUser} />
      </Sidebar>
      <SidebarInset>
        <AppHeader user={appUser} />
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
