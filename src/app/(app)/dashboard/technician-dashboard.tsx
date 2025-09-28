
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect, useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { format, formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { ArrowDown, ArrowUp, CheckCircle, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
    isOverdue?: boolean; // Placeholder for overdue logic
}

type SortableColumns = 'patient' | 'accession' | 'received';

interface AutoVerifiedItem {
    accessionNumber: string;
    patientName: string;
    mrn: string;
    testName: string;
    result: string;
    verifiedAt: Date;
    orderId: string;
}


const placeholderAutoVerified: AutoVerifiedItem[] = [
    { accessionNumber: 'ACC-2024-00102', patientName: 'Emily Davis', mrn: 'ED-0003', testName: 'Sodium', result: '140 mmol/L', verifiedAt: new Date(new Date().setHours(new Date().getHours() - 1)), orderId: 'ORD-2025-00003' },
    { accessionNumber: 'ACC-2024-00102', patientName: 'Emily Davis', mrn: 'ED-0003', testName: 'Potassium', result: '4.1 mmol/L', verifiedAt: new Date(new Date().setHours(new Date().getHours() - 1)), orderId: 'ORD-2025-00003' },
    { accessionNumber: 'ACC-2024-00101', patientName: 'Brian Williams', mrn: 'BW-0002', testName: 'Glucose', result: '92 mg/dL', verifiedAt: new Date(new Date().setHours(new Date().getHours() - 2)), orderId: 'ORD-2025-00002' },
];

export function TechnicianDashboard() {
  const { token } = useAuth();
  const { toast } = useToast();
  const [worklist, setWorklist] = useState<WorklistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState<SortableColumns | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');


  useEffect(() => {
    if (!token) return;

    const fetchWorklist = async () => {
        if (!isLoading) setIsLoading(true); // Only set loading on subsequent fetches
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

  const handleSort = (column: SortableColumns) => {
    if (sortColumn === column) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const filteredAndSortedWorklist = useMemo(() => {
    let filtered = [...worklist];

    if (searchTerm) {
      const lowercasedFilter = searchTerm.toLowerCase();
      filtered = filtered.filter(item => {
        return (
          item.patientDetails?.fullName.toLowerCase().includes(lowercasedFilter) ||
          item.patientDetails?.mrn.toLowerCase().includes(lowercasedFilter) ||
          item.sample.accessionNumber?.toLowerCase().includes(lowercasedFilter) ||
          item.sample.tests.some(t => t.name.toLowerCase().includes(lowercasedFilter))
        );
      });
    }

    if (sortColumn) {
        filtered.sort((a, b) => {
            let valA: string | number | Date = '';
            let valB: string | number | Date = '';

            switch (sortColumn) {
                case 'patient':
                    valA = a.patientDetails?.fullName || '';
                    valB = b.patientDetails?.fullName || '';
                    break;
                case 'accession':
                    valA = a.sample.accessionNumber || '';
                    valB = b.sample.accessionNumber || '';
                    break;
                case 'received':
                    valA = new Date(a.sample.receivedTimestamp || 0);
                    valB = new Date(b.sample.receivedTimestamp || 0);
                    break;
            }
            
            if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
            if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
    }
    
    // Always keep STAT at the top if no primary sort is active or as a secondary sort
    if (sortColumn !== 'accession' && sortColumn !== 'received' && sortColumn !== 'patient') {
        filtered.sort((a, b) => {
            if (a.priority === 'STAT' && b.priority !== 'STAT') return -1;
            if (a.priority !== 'STAT' && b.priority === 'STAT') return 1;
            return 0;
        });
    }


    return filtered;
  }, [worklist, searchTerm, sortColumn, sortDirection]);

  const SortableHeader = ({ column, title }: { column: SortableColumns; title: string }) => (
    <TableHead>
        <Button variant="ghost" onClick={() => handleSort(column)} className="px-0 hover:bg-transparent">
            {title}
            {sortColumn === column && (
                sortDirection === 'asc' ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />
            )}
        </Button>
    </TableHead>
  );

  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-headline text-3xl font-semibold">Technician Dashboard</h1>
        <Tabs defaultValue="worklist">
            <TabsList>
                <TabsTrigger value="worklist">Active Worklist ({isLoading ? '...' : filteredAndSortedWorklist.length})</TabsTrigger>
                <TabsTrigger value="auto-verified">Auto-Verified Log</TabsTrigger>
            </TabsList>
            <TabsContent value="worklist">
                 <Card>
                    <CardHeader>
                    <CardTitle>Active Samples</CardTitle>
                    <CardDescription>
                        Dynamic, prioritized list of all samples currently in the lab.
                    </CardDescription>
                        <div className="relative pt-4">
                            <Search className="absolute left-2.5 top-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                            placeholder="Filter by patient, accession #, or test..."
                            className="pl-8"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </CardHeader>
                    <CardContent>
                    <Table>
                        <TableHeader>
                        <TableRow>
                            <TableHead>Priority</TableHead>
                            <SortableHeader column="accession" title="Accession #" />
                            <SortableHeader column="patient" title="Patient" />
                            <TableHead>Tests</TableHead>
                            <SortableHeader column="received" title="Received" />
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
                        ) : filteredAndSortedWorklist.length > 0 ? (
                            filteredAndSortedWorklist.map(item => (
                                <TableRow 
                                    key={item.sample.accessionNumber} 
                                    className={cn(
                                        item.priority === 'STAT' && 'bg-destructive/20 text-destructive-foreground hover:bg-destructive/30',
                                        item.isOverdue && 'bg-amber-500/20' // Placeholder for overdue styling as per design system (#F0AD4E)
                                    )}
                                >
                                    <TableCell>
                                        <Badge 
                                            variant={item.priority === 'STAT' ? 'destructive' : 'default'}
                                            className={cn(item.priority === 'STAT' && 'bg-destructive text-destructive-foreground')}
                                        >
                                            {item.priority}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="font-medium font-code">
                                        <Link 
                                            href={`/orders/${item.orderId}`} 
                                            className={cn(
                                                'text-primary hover:underline',
                                                item.priority === 'STAT' && 'text-destructive-foreground/90 hover:text-destructive-foreground font-semibold'
                                            )}
                                        >
                                            {item.sample.accessionNumber}
                                        </Link>
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-medium">{item.patientDetails?.fullName || 'N/A'}</div>
                                        <div className={cn(
                                            "text-sm text-muted-foreground font-code",
                                            item.priority === 'STAT' && 'text-destructive-foreground/70'
                                        )}>
                                            {item.patientDetails?.mrn || 'N/A'}
                                        </div>
                                    </TableCell>
                                    <TableCell>{item.sample.tests.map(t => t.name).join(', ')}</TableCell>
                                    <TableCell>
                                        {item.sample.receivedTimestamp ? 
                                            formatDistanceToNow(new Date(item.sample.receivedTimestamp), { addSuffix: true })
                                            : 'N/A'
                                        }
                                    </TableCell>
                                    <TableCell>
                                        <Badge 
                                            variant="secondary"
                                            className={cn(item.priority === 'STAT' && 'bg-destructive-foreground/20 text-destructive-foreground')}
                                        >
                                            {item.sample.status}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center h-24">
                                    No active samples match your search criteria.
                                </TableCell>
                            </TableRow>
                        )}
                        </TableBody>
                    </Table>
                    </CardContent>
                </Card>
            </TabsContent>
             <TabsContent value="auto-verified">
                <Card>
                    <CardHeader>
                        <CardTitle>Auto-Verified Results Log</CardTitle>
                        <CardDescription>
                            A log of recent results that were automatically verified and released by the system.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Accession #</TableHead>
                                    <TableHead>Patient</TableHead>
                                    <TableHead>Test</TableHead>
                                    <TableHead>Result</TableHead>
                                    <TableHead>Verified At</TableHead>
                                </TableRow>
                            </TableHeader>
                             <TableBody>
                                {placeholderAutoVerified.map(item => (
                                    <TableRow key={`${item.accessionNumber}-${item.testName}`}>
                                        <TableCell className="font-code">
                                            <Link href={`/orders/${item.orderId}`} className="text-primary hover:underline">
                                                {item.accessionNumber}
                                            </Link>
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium">{item.patientName}</div>
                                            <div className="text-sm text-muted-foreground font-code">{item.mrn}</div>
                                        </TableCell>
                                        <TableCell>{item.testName}</TableCell>
                                        <TableCell>{item.result}</TableCell>
                                        <TableCell>{format(item.verifiedAt, 'HH:mm:ss')}</TableCell>
                                    </TableRow>
                                ))}
                             </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    </div>
  );
}
