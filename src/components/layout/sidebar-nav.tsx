'use client';

import {
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import Logo from '@/components/logo';
import {
  LayoutDashboard,
  FilePlus2,
  LogOut,
  Settings,
  FileClock,
  History,
  Sparkles,
} from 'lucide-react';
import type { User } from '@/lib/types';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/firebase';

export default function SidebarNavigation({ user }: { user: User }) {
  const pathname = usePathname();
  const auth = useAuth();
  const router = useRouter();

  const citizenNav = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/report', label: 'New Report', icon: FilePlus2 },
    { href: '/my-reports', label: 'My Reports', icon: History },
  ];

  const authorityNav = [
    { href: '/authority', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/authority/reports', label: 'Recent Reports', icon: FileClock },
  ];

  const commonNav = [{ href: '/settings', label: 'Settings', icon: Settings }];

  const navItems = user.role === 'citizen' ? citizenNav : authorityNav;

  const handleLogout = async () => {
    await auth.signOut();
    router.push('/login');
  };

  return (
    <>
      <SidebarHeader className="p-4 justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 group-data-[collapsible=icon]:hidden"
        >
          <Sparkles className="w-8 h-8 text-primary animate-ai-pulse" />
          <span className="text-xl font-headline font-semibold">CivicLens</span>
        </Link>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
                tooltip={item.label}
              >
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-2">
        <SidebarMenu>
          {commonNav.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
                tooltip={item.label}
              >
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Log Out" onClick={handleLogout}>
              <LogOut />
              <span>Log Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </>
  );
}
