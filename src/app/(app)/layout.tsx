'use client';

import { redirect } from 'next/navigation';
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
} from '@/components/ui/sidebar';
import SidebarNavigation from '@/components/layout/sidebar-nav';
import AppHeader from '@/components/layout/header';
import { useUser } from '@/firebase';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [isUserLoading, user, router]);

  if (isUserLoading || !user) {
    return <div>Loading...</div>; // Or a proper loading spinner
  }

  // This is a placeholder for the user data structure you might have
  const appUser = {
    uid: user.uid,
    fullName: user.displayName || user.email || 'Anonymous',
    email: user.email || '',
    role: user.isAnonymous ? 'citizen' : ('authority' as 'citizen' | 'authority'),
  };

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
