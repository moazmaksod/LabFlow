
'use client';
import '../globals.css';
import React from 'react';

// This is a minimal layout for the print view.
// It should NOT contain <html>, <body>, or <head> tags.
export default function PrintLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      {children}
    </>
  );
}
