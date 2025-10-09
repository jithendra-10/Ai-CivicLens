import { SidebarTrigger } from '@/components/ui/sidebar';
import { UserNav } from '@/components/auth/user-nav';
import { getCurrentUser } from '@/lib/auth';

export default async function AppHeader() {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
      <div className="md:hidden">
        <SidebarTrigger />
      </div>
      <div className="flex w-full items-center justify-end gap-4">
        {user && <UserNav user={user} />}
      </div>
    </header>
  );
}
