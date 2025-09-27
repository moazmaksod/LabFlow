
'use client';
import { AuthProvider } from '@/hooks/use-auth';
import '../globals.css';

// This is a minimal layout for the print view.
// It should not contain <html> or <body> tags.
// It only provides the necessary context (like AuthProvider) for its children.
export default function PrintLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <AuthProvider>
        {children}
      </AuthProvider>
  );
}
