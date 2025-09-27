
'use client';
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
          {children}
      </body>
    </html>
  );
}
