
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
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { PlaceHolderImages } from '@/lib/images';
import { AuthProvider, useAuth } from '@/hooks/use-auth';
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
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={pathname === '/dashboard'}
              tooltip="Dashboard"
            >
              <Link href="/dashboard">
                <BarChart3 />
                <span>Dashboard</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname.startsWith('/patients')} tooltip="Patients">
              <Link href="/patients">
                <Users />
                <span>Patients</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
           <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname.startsWith('/orders')} tooltip="Orders">
              <Link href="/orders">
                <ClipboardList />
                <span>Orders</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname.startsWith('/lab')} tooltip="Lab Workflow">
              <Link href="/lab">
                <FlaskConical />
                <span>Lab Workflow</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
           <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname.startsWith('/results')} tooltip="Results">
              <Link href="/results">
                <FileText />
                <span>Results</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname.startsWith('/inventory')} tooltip="Inventory">
              <Link href="/inventory">
                <Warehouse />
                <span>Inventory</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
           <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname.startsWith('/billing')} tooltip="Billing">
              <Link href="/billing">
                <FileBox />
                <span>Billing</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname.startsWith('/management')} tooltip="Management">
              <Link href="/management">
                <Settings />
                <span>Management</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
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


function ProtectedAppLayout({ children }: { children: React.ReactNode }) {
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


export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ProtectedAppLayout>{children}</ProtectedAppLayout>
    </AuthProvider>
  );
}
