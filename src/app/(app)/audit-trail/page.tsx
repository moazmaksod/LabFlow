
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
import React, { useState, useCallback } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { History, Loader2, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { AuditLog } from '@/lib/schemas/audit-log';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

type AuditLogWithUser = AuditLog & {
  userDetails?: {
    fullName: string;
  }
}

// A component to render details in a readable format
const AuditDetails = ({ details, action }: { details: any, action: string }) => {
    if (!details) {
        return <span className="text-muted-foreground">N/A</span>;
    }

    // Standardize display for common audit actions
    const detailItems = [];
    if(details.orderId) detailItems.push(<span key="oid">Order: <span className='font-code'>{details.orderId}</span></span>);
    if(details.newAccessionNumber) detailItems.push(<span key="acc">Accession #: <span className='font-code'>{details.newAccessionNumber}</span></span>);
    if(details.newOrderStatus) detailItems.push(<span key="status">New Status: <Badge variant="outline">{details.newOrderStatus}</Badge></span>);
    if(details.amount) detailItems.push(<span key="amt">Amount: ${details.amount.toFixed(2)}</span>);
    if(details.method) detailItems.push(<span key="method">Method: {details.method}</span>);
    
    if (action === 'PATIENT_CREATE') {
        if(details.fullName) detailItems.push(<span key="name">Patient: {details.fullName}</span>);
        if(details.mrn) detailItems.push(<span key="mrn">MRN: <span className='font-code'>{details.mrn}</span></span>);
    }
    
    if (action === 'ORDER_CREATE') {
        if(details.patientName) detailItems.push(<span key="patient">For Patient: {details.patientName} (MRN: <span className='font-code'>{details.patientMrn}</span>)</span>);
        if(details.testCount) detailItems.push(<span key="tests">{details.testCount} test(s) ordered</span>);
    }


    if (action === 'USER_LOGIN') {
        return <Badge variant="secondary">Successful Login</Badge>
    }

    if (detailItems.length > 0) {
        return <div className='flex flex-col text-xs gap-1'>{detailItems}</div>;
    }

    // Fallback for any other details
    return <pre className="text-xs font-code bg-muted p-2 rounded-md">{JSON.stringify(details, null, 2)}</pre>;
};


export default function AuditTrailPage() {
  const { user, token } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [logs, setLogs] = useState<AuditLogWithUser[]>([]);

  // If the user is not a manager, render a skeleton while the redirect happens.
  React.useEffect(() => {
    if (user && user.role !== 'manager') {
      router.push('/dashboard');
    }
  }, [user, router]);
  
  const fetchLatestLogs = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const response = await fetch('/api/v1/audit-logs', {
         headers: { Authorization: `Bearer ${token}` },
      });
      if(response.ok) {
        const result = await response.json();
        setLogs(result.data);
      } else {
        toast({ variant: 'destructive', title: "Fetch failed", description: "Could not retrieve latest audit logs."});
      }
    } catch (error) {
       toast({ variant: 'destructive', title: "Network Error", description: "Could not connect to the server."});
    } finally {
      setIsLoading(false);
    }
  }, [token, toast]);

  // Fetch latest logs on component mount
  React.useEffect(() => {
    fetchLatestLogs();
  }, [fetchLatestLogs]);


  const handleSearch = async () => {
    if (!searchTerm) {
      // If search is cleared, fetch latest logs again
      fetchLatestLogs();
      return;
    }

    if (!token) return;

    setIsLoading(true);
    setLogs([]);
    try {
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
            Enter a Patient MRN, Order ID, or Accession Number to find related activity. Clear the search to see the latest activity.
          </CardDescription>
        </CardHeader>
        <CardContent>
           <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="flex w-full max-w-lg items-center space-x-2">
              <Input 
                  placeholder="e.g., ACC-2024-00001 or leave blank for latest" 
                  className="h-11"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Button type="submit" size="lg" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Search className="mr-2 h-4 w-4" />
                  Search
              </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Activity Log</CardTitle>
           <CardDescription>
            {searchTerm ? `Showing results for "${searchTerm}"` : "Showing the 50 most recent system events."}
          </CardDescription>
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
                 Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                        <TableCell colSpan={4}><Skeleton className="h-8 w-full" /></TableCell>
                    </TableRow>
                  ))
              ) : logs.length > 0 ? (
                 logs.map((log) => (
                    <TableRow key={log._id}>
                      <TableCell className="text-sm">{format(new Date(log.timestamp), 'yyyy-MM-dd HH:mm:ss')}</TableCell>
                      <TableCell>{log.userDetails?.fullName || log.userId}</TableCell>
                      <TableCell>
                        <Badge variant='outline'>{log.action.replace(/_/g, ' ')}</Badge>
                      </TableCell>
                      <TableCell>
                        <AuditDetails details={log.details} action={log.action} />
                      </TableCell>
                    </TableRow>
                  ))
              ) : (
                 <TableRow>
                    <TableCell colSpan={4} className="text-center h-24">
                       No activity logs found.
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
