
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { format, formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface WorklistItem {
    sample: {
        accessionNumber?: string;
        sampleType: string;
        status: string;
        receivedTimestamp?: string;
        tests: {
            testCode: string;
            name: string;
        }[];
    },
    orderId: string;
    priority: 'Routine' | 'STAT';
    patientDetails?: {
        fullName: string;
        mrn: string;
    };
}

const priorityVariant: { [key: string]: 'default' | 'destructive' } = {
  'STAT': 'destructive',
  'Routine': 'default',
};

export function TechnicianDashboard() {
  const { token } = useAuth();
  const { toast } = useToast();
  const [worklist, setWorklist] = useState<WorklistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!token) return;

    const fetchWorklist = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/v1/worklist', {
                headers: { Authorization: `Bearer ${token}` },
            });
            if(response.ok) {
                const result = await response.json();
                setWorklist(result.data);
            } else {
                toast({ variant: 'destructive', title: 'Failed to load worklist.' });
            }
        } catch (error) {
            toast({ variant: 'destructive', title: 'Network error fetching worklist.' });
        } finally {
            setIsLoading(false);
        }
    };
    
    fetchWorklist();

    const interval = setInterval(fetchWorklist, 30000); // Auto-refresh every 30 seconds
    return () => clearInterval(interval);

  }, [token, toast]);

  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-headline text-3xl font-semibold">Technician Worklist</h1>
       <Card>
        <CardHeader>
          <CardTitle>Active Samples</CardTitle>
          <CardDescription>
            Dynamic, prioritized list of all samples currently in the lab.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Priority</TableHead>
                <TableHead>Accession #</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Tests</TableHead>
                <TableHead>Received</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                        <TableCell colSpan={6}><Skeleton className="h-8 w-full" /></TableCell>
                    </TableRow>
                ))
              ) : worklist.length > 0 ? (
                worklist.map(item => (
                    <TableRow key={item.sample.accessionNumber} className={cn(item.priority === 'STAT' && 'bg-destructive/10 hover:bg-destructive/20')}>
                        <TableCell>
                            <Badge variant={priorityVariant[item.priority]}>{item.priority}</Badge>
                        </TableCell>
                        <TableCell className="font-medium font-code">
                             <Link href={`/orders/${item.orderId}`} className="text-primary hover:underline">
                                {item.sample.accessionNumber}
                            </Link>
                        </TableCell>
                        <TableCell>
                            <div className="font-medium">{item.patientDetails?.fullName || 'N/A'}</div>
                            <div className="text-sm text-muted-foreground font-code">{item.patientDetails?.mrn || 'N/A'}</div>
                        </TableCell>
                        <TableCell>{item.sample.tests.map(t => t.name).join(', ')}</TableCell>
                        <TableCell>
                            {item.sample.receivedTimestamp ? 
                                formatDistanceToNow(new Date(item.sample.receivedTimestamp), { addSuffix: true })
                                : 'N/A'
                            }
                        </TableCell>
                        <TableCell>
                            <Badge variant="secondary">{item.sample.status}</Badge>
                        </TableCell>
                    </TableRow>
                ))
              ) : (
                 <TableRow>
                    <TableCell colSpan={6} className="text-center h-24">
                        No active samples in the worklist.
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
