
'use client';
import { AuthProvider } from '@/hooks/use-auth';
import '../globals.css';

// This is a minimal layout for the print view.
export default function PrintLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html>
      <head>
         <title>Printing - LabFlow</title>
      </head>
      <body>
        <AuthProvider>
            {children}
        </AuthProvider>
      </body>
    </html>
  );
}

    