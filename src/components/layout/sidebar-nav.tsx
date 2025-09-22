
'use client';

import { usePathname } from 'next/navigation';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  Beaker,
  Boxes,
  FileText,
  Settings,
  CreditCard,
} from 'lucide-react';

const links = [
  {
    title: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    title: 'Orders',
    href: '/orders',
    icon: ClipboardList,
  },
  {
    title: 'Patients',
    href: '/patients',
    icon: Users,
  },
  {
    title: 'Lab',
    href: '/lab',
    icon: Beaker,
  },
  {
    title: 'Inventory',
    href: '/inventory',
    icon: Boxes,
  },
  {
    title: 'Results',
    href: '/results',
    icon: FileText,
  },
  {
    title: 'Billing',
    href: '/billing',
    icon: CreditCard,
  },
  {
    title: 'Management',
    href: '/management',
    icon: Settings,
  },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <SidebarMenu>
      {links.map((link) => (
        <SidebarMenuItem key={link.href}>
          <SidebarMenuButton
            asChild
            // For the dashboard, we need exact match. For others, we check if the path starts with the href.
            isActive={
              link.href === '/' ? pathname === '/' : pathname.startsWith(link.href)
            }
            tooltip={link.title}
          >
            <a href={link.href}>
              <link.icon />
              <span>{link.title}</span>
            </a>

          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
