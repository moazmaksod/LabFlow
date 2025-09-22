
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
} from '@/components/ui/sidebar';
import { Icons } from '@/components/icons';
import { Header } from '@/components/layout/header';
import { ThemeProvider } from '@/components/theme-provider';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { LifeBuoy, LogOut } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'LabFlow',
  description: 'Modern Laboratory Information System',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700&family=Source+Code+Pro&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SidebarProvider>
            <div className="flex">
                <Sidebar collapsible>
                <SidebarHeader>
                    <div className="flex items-center gap-2 p-2 group-data-[collapsible=icon]:justify-center">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                        <Icons.logo className="size-5" />
                    </div>
                    <div
                        data-sidebar="group-label"
                        className="text-lg font-semibold group-data-[collapsible=icon]:hidden"
                    >
                        LabFlow
                    </div>
                    </div>
                </SidebarHeader>
                <SidebarContent className="p-2" />
                <SidebarFooter className="p-2">
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton tooltip="Support" asChild>
                            <Link href="/support">
                                <LifeBuoy />
                                <span>Support</span>
                            </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton tooltip="Log out">
                                <LogOut />
                                <span>Log out</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarFooter>
                </Sidebar>
                <SidebarInset>
                <Header />
                <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
                </SidebarInset>
            </div>
          </SidebarProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}

    
