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
  ListOrdered,
  LogOut,
  Settings,
} from 'lucide-react';
import type { User } from '@/lib/types';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logout } from '@/app/login/actions';

export default function SidebarNavigation({ user }: { user: User }) {
  const pathname = usePathname();

  const citizenNav = [
    { href: '/report', label: 'New Report', icon: FilePlus2 },
    // { href: '/my-reports', label: 'My Reports', icon: ListOrdered },
  ];

  const authorityNav = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    // { href: '/settings', label: 'Settings', icon: Settings },
  ];

  const navItems = user.role === 'citizen' ? citizenNav : authorityNav;

  return (
    <>
      <SidebarHeader className="p-4">
        <Link href="/" className="flex items-center gap-2">
          <Logo className="w-8 h-8 text-primary" />
          <span className="text-xl font-headline font-semibold">CivicAI</span>
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
        <form action={logout}>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Log Out">
                <button type="submit" className="w-full">
                  <LogOut />
                  <span>Log Out</span>
                </button>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </form>
      </SidebarFooter>
    </>
  );
}
