
import { AuthProvider } from '@/hooks/use-auth';

// This is a minimal layout specifically for printing.
// It does not include the main sidebar, header, or authentication checks.
export default function PrintLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // We still need the AuthProvider so the print page can use useAuth() to get the token.
    <AuthProvider>
        {children}
    </AuthProvider>
  );
}
