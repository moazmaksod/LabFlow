
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
  SidebarTrigger,
  useSidebar
} from '@/components/ui/sidebar';
import { Icons } from '@/components/icons';
import { Header } from '@/components/layout/header';
import { ThemeProvider } from '@/components/theme-provider';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { LifeBuoy, LogOut } from 'lucide-react';
import Link from 'next/link';
import { SidebarNav } from '@/components/layout/sidebar-nav';
import { Separator } from '@/components/ui/separator';
import { AppSidebar } from '@/components/layout/app-sidebar';

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
                <AppSidebar />
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
