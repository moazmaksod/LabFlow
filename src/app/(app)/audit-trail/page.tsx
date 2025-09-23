
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function AuditTrailPage() {
  const { user } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    // This is the client-side equivalent of RBAC middleware.
    // If a non-manager tries to access this page, redirect them.
    if (user && user.role !== 'manager') {
      router.push('/dashboard');
    }
  }, [user, router]);

  // If the user is not a manager, render nothing or a loading state
  // while the redirect happens.
  if (user?.role !== 'manager') {
    return (
       <div className="flex min-h-screen items-center justify-center">
         <Skeleton className="h-32 w-full" />
       </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-headline text-3xl font-semibold">Audit Trail</h1>
      <Card>
        <CardHeader>
          <CardTitle>System Audit Logs</CardTitle>
          <CardDescription>
            This page is for managers only and demonstrates RBAC.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>
            In a real application, this page would contain a powerful query
            interface for searching and filtering immutable audit logs for
            compliance checks.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
