
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { Header } from '@/components/layout/header';
import { ThemeProvider } from '@/components/theme-provider';
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
              <div className="flex-1">
                <SidebarInset className="flex flex-col">
                  <Header />
                  <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
                </SidebarInset>
              </div>
            </div>
          </SidebarProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
