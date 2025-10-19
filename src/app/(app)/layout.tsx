
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
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

function AppLayoutContent({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
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

  if (isUserLoading || (user && isAppUserLoading) || !appUser) {
    return (
      <>
        {/* Render a minimal structure for the loading state to be centered */}
        <Sidebar variant="inset">
           {/* Skeleton or empty nav can go here if needed */}
        </Sidebar>
        <SidebarInset>
          <Loading />
        </SidebarInset>
      </>
    );
  }


  return (
    <>
      <Sidebar variant="inset">
        <SidebarNavigation user={appUser} />
      </Sidebar>
      <SidebarInset>
        <AppHeader user={appUser} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </SidebarInset>
    </>
  );
}


export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppLayoutContent>{children}</AppLayoutContent>
    </SidebarProvider>
  );
}
