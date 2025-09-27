
'use client';
import { AuthProvider } from '@/hooks/use-auth';

// This is a minimal layout specifically for printing.
// It does not include the main sidebar, header, or other UI elements.
export default function PrintLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // We still need the AuthProvider so the print page can use useAuth() to get the token.
    <AuthProvider>
      <html>
        <head>
           <script src="https://cdn.tailwindcss.com"></script>
           <style>{`
              @media print {
                @page { size: auto; margin: 0; }
                body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
              }
           `}</style>
        </head>
        <body className="bg-gray-100">
            {children}
        </body>
      </html>
    </AuthProvider>
  );
}
