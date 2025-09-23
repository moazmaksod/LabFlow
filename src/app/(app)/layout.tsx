
'use client';

import * as React from 'react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import {
  Bell,
  BarChart3,
  FlaskConical,
  Users,
  ClipboardList,
  FileText,
  LifeBuoy,
  User,
  Settings,
  LogOut,
  Warehouse,
  FileBox,
  LayoutDashboard,
  CalendarClock,
  Scan,
  TestTube,
  FileCheck,
  ShieldCheck,
  Package,
  History,
  UserCog,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { PlaceHolderImages } from '@/lib/images';
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';

function AppSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const userAvatar = PlaceHolderImages.find(
    (img) => img.id === 'user-avatar-1'
  );
  
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  }

  const receptionistNav = (
    <>
      <SidebarMenuItem>
        <SidebarMenuButton asChild isActive={pathname === '/dashboard'} tooltip="Dashboard">
          <Link href="/dashboard"><LayoutDashboard /><span>Dashboard</span></Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton asChild isActive={pathname.startsWith('/patients')} tooltip="Patient Registration">
          <Link href="/patients"><Users /><span>Patient Registration</span></Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton asChild isActive={pathname.startsWith('/orders')} tooltip="Order Entry">
          <Link href="/orders"><ClipboardList /><span>Order Entry</span></Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton asChild isActive={pathname.startsWith('/scheduling')} tooltip="Scheduling">
          <Link href="/scheduling"><CalendarClock /><span>Scheduling</span></Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </>
  );

  const technicianNav = (
     <>
      <SidebarMenuItem>
        <SidebarMenuButton asChild isActive={pathname === '/dashboard'} tooltip="Worklist">
          <Link href="/dashboard"><LayoutDashboard /><span>Worklist</span></Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton asChild isActive={pathname.startsWith('/accessioning')} tooltip="Accessioning">
          <Link href="/accessioning"><Scan /><span>Accessioning</span></Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton asChild isActive={pathname.startsWith('/testing')} tooltip="Testing">
          <Link href="/testing"><TestTube /><span>Testing</span></Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton asChild isActive={pathname.startsWith('/quality-control')} tooltip="Quality Control">
          <Link href="/quality-control"><ShieldCheck /><span>Quality Control</span></Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton asChild isActive={pathname.startsWith('/inventory/search')} tooltip="Inventory Search">
          <Link href="/inventory/search"><Package /><span>Inventory Search</span></Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </>
  );

  const managerNav = (
     <>
      <SidebarMenuItem>
        <SidebarMenuButton asChild isActive={pathname === '/dashboard'} tooltip="KPI Dashboard">
          <Link href="/dashboard"><LayoutDashboard /><span>KPI Dashboard</span></Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
       <SidebarMenuItem>
        <SidebarMenuButton asChild isActive={pathname.startsWith('/reports')} tooltip="Reports & Analytics">
          <Link href="/reports"><BarChart3 /><span>Reports & Analytics</span></Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton asChild isActive={pathname.startsWith('/inventory')} tooltip="Inventory Management">
          <Link href="/inventory"><Warehouse /><span>Inventory Management</span></Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton asChild isActive={pathname.startsWith('/quality')} tooltip="Quality Assurance">
          <Link href="/quality"><ShieldCheck /><span>Quality Assurance</span></Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton asChild isActive={pathname.startsWith('/users')} tooltip="User Management">
          <Link href="/users"><UserCog /><span>User Management</span></Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton asChild isActive={pathname.startsWith('/audit-trail')} tooltip="Audit Trail">
          <Link href="/audit-trail"><History /><span>Audit Trail</span></Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </>
  );

  const renderNav = () => {
    switch (user?.role) {
      case 'receptionist':
        return receptionistNav;
      case 'technician':
        return technicianNav;
      case 'manager':
        return managerNav;
      default:
        // Default or loading state
        return (
          <>
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </>
        );
    }
  };

  return (
    <Sidebar
      collapsible
      className="border-sidebar-border"
      variant="sidebar"
      side="left"
    >
      <SidebarHeader className="h-16 p-2">
        <div className="flex h-full w-full items-center gap-2 overflow-hidden px-2">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Icons.logo className="size-6" />
          </div>
          <span className="text-xl font-semibold">LabFlow</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {user ? renderNav() : (
             <>
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </>
          )}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={pathname === '/support'}
              tooltip="Support"
            >
              <Link href="/support">
                <LifeBuoy />
                <span>Support</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton>
                  <Avatar className="size-7">
                     {userAvatar && (
                      <AvatarImage
                        src={userAvatar.imageUrl}
                        alt="User avatar"
                        data-ai-hint={userAvatar.imageHint}
                      />
                    )}
                    <AvatarFallback>{user ? getInitials(user.firstName, user.lastName) : '...'}</AvatarFallback>
                  </Avatar>
                  <div className="flex w-full min-w-0 flex-col items-start justify-start">
                    {user ? (
                      <>
                        <span className="max-w-full truncate">{user.firstName} {user.lastName}</span>
                        <span className="max-w-full truncate text-xs text-sidebar-foreground/70 capitalize">
                          {user.role}
                        </span>
                      </>
                    ) : (
                      <div className="w-full space-y-1">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    )}
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  {user ? (
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <User className="mr-2" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="mr-2" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-10 flex h-16 w-full shrink-0 items-center justify-between border-b bg-background px-4">
      <div className="flex items-center gap-1">
        <SidebarTrigger className="md:hidden" />
      </div>
      <div className="flex items-center justify-end gap-2">
        <Button variant="ghost" size="icon">
          <Bell />
          <span className="sr-only">Notifications</span>
        </Button>
      </div>
    </header>
  );
}


export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    // You can render a loading spinner here
    return (
       <div className="flex min-h-screen items-center justify-center">
         <div className="flex items-center gap-2">
           <Icons.logo className="size-8 animate-spin" />
           <span className="text-lg font-semibold">Loading LabFlow...</span>
         </div>
       </div>
    )
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex flex-col">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
