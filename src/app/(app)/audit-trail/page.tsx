
'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { History, Loader2, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { AuditLog } from '@/lib/schemas/audit-log';
import { format } from 'date-fns';

type AuditLogWithUser = AuditLog & {
  userDetails?: {
    fullName: string;
  }
}

export default function AuditTrailPage() {
  const { user, token } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [logs, setLogs] = useState<AuditLogWithUser[]>([]);

  React.useEffect(() => {
    // This is the client-side equivalent of RBAC middleware.
    // If a non-manager tries to access this page, redirect them.
    if (user && user.role !== 'manager') {
      router.push('/dashboard');
    }
  }, [user, router]);

  const handleSearch = async () => {
    if (!searchTerm || !token) return;

    setIsLoading(true);
    setLogs([]);
    try {
      // We are searching by Accession Number, which is part of the 'details' in the audit log.
      // A real API would support more complex queries, but for now we search by entityId.
      // This is a simplification; a full implementation might search details.newAccessionNumber.
      // For now, let's assume we search by a related ID.
      const response = await fetch(`/api/v1/audit-logs?searchTerm=${searchTerm}`, {
         headers: { Authorization: `Bearer ${token}` },
      });

      if(response.ok) {
        const result = await response.json();
        setLogs(result.data);
         if (result.data.length === 0) {
           toast({
            title: "No logs found",
            description: `No audit trail entries match "${searchTerm}".`
           })
         }
      } else {
        toast({ variant: 'destructive', title: "Search failed", description: "Could not retrieve audit logs."});
      }

    } catch (error) {
       toast({ variant: 'destructive', title: "Network Error", description: "Could not connect to the server."});
    } finally {
      setIsLoading(false);
    }
  }

  // If the user is not a manager, render a skeleton while the redirect happens.
  if (user?.role !== 'manager') {
    return (
       <div className="flex min-h-screen items-center justify-center">
         <Skeleton className="h-screen w-full" />
       </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
       <div className="flex items-center gap-4">
        <History className="size-10 text-muted-foreground" />
        <div>
          <h1 className="font-headline text-3xl font-semibold">Audit Trail</h1>
          <p className="text-muted-foreground">
            Search and review system activity for compliance.
          </p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Search Audit Logs</CardTitle>
          <CardDescription>
            Enter a Patient MRN, Order ID, or Accession Number to find all related activity.
          </CardDescription>
        </CardHeader>
        <CardContent>
           <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="flex w-full max-w-lg items-center space-x-2">
              <Input 
                  placeholder="e.g., ACC-2024-00001" 
                  className="h-11"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Button type="submit" size="lg" disabled={isLoading || !searchTerm}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Search className="mr-2 h-4 w-4" />
                  Search
              </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Search Results</CardTitle>
        </CardHeader>
        <CardContent>
           <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                 Array.from({ length: 3 }).map((_, i) => (
                    <TableRow key={i}>
                        <TableCell colSpan={4}><Skeleton className="h-6 w-full" /></TableCell>
                    </TableRow>
                  ))
              ) : logs.length > 0 ? (
                 logs.map((log) => (
                    <TableRow key={log._id}>
                      <TableCell>{format(new Date(log.timestamp), 'yyyy-MM-dd HH:mm:ss')}</TableCell>
                      <TableCell>{log.userDetails?.fullName || log.userId}</TableCell>
                      <TableCell className="font-medium">{log.action}</TableCell>
                      <TableCell className="font-code text-xs">
                        {log.details ? JSON.stringify(log.details) : 'N/A'}
                      </TableCell>
                    </TableRow>
                  ))
              ) : (
                 <TableRow>
                    <TableCell colSpan={4} className="text-center h-24">
                       Please enter a search term to view audit logs.
                    </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
