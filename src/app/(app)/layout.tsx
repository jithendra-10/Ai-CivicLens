import { redirect } from 'next/navigation';
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
} from '@/components/ui/sidebar';
import { getCurrentUser } from '@/lib/auth';
import SidebarNavigation from '@/components/layout/sidebar-nav';
import AppHeader from '@/components/layout/header';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarNavigation user={user} />
      </Sidebar>
      <SidebarInset>
        <AppHeader />
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
