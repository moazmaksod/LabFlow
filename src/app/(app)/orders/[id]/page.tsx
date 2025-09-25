
'use client';
import { Badge } from '@/components/ui/badge';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ClipboardList, Printer, Save, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import type { Order } from '@/lib/schemas/order';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

const statusVariant: { [key: string]: 'default' | 'secondary' | 'outline' } = {
  Completed: 'default',
  'In-Progress': 'secondary',
  'Awaiting Validation': 'outline',
  'Pending': 'outline',
};
const statuses = ['In-Progress', 'Awaiting Validation', 'Completed'];

// We need to add the patientDetails from the aggregation to the Order type
type OrderWithPatient = Order & {
    patientDetails: {
        _id: string;
        fullName: string;
        mrn: string;
    }
}

export default function OrderDetailsPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const { token } = useAuth();
  const { toast } = useToast();
  const [orderDetails, setOrderDetails] = useState<OrderWithPatient | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id || !token) return;

    const fetchOrder = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/v1/orders/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const result = await response.json();
          setOrderDetails(result.data);
        } else {
          toast({
            variant: 'destructive',
            title: 'Failed to fetch order details',
            description: `Order ${id} not found.`,
          });
        }
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Network Error',
          description: 'Could not connect to the server.',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [id, token, toast]);

  if (isLoading) {
    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-md" />
                <div className="space-y-2">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-64" />
                </div>
            </div>
             <Skeleton className="h-96 w-full" />
             <Skeleton className="h-48 w-full" />
        </div>
    )
  }

  if (!orderDetails) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold">Order Not Found</h1>
        <p className="text-muted-foreground">The order with ID {id} could not be found.</p>
        <Button asChild className="mt-4">
            <Link href="/orders">Back to Orders</Link>
        </Button>
      </div>
    );
  }

  // Calculate total price from all tests in all samples
  // In a real app, this might be stored on the order itself.
  const totalOrderPrice = orderDetails.samples.reduce((sampleTotal, sample) => {
      const testsTotal = sample.tests.reduce((testTotal, test) => {
          // This is a simplification. We'd need to look up the price from the catalog snapshot
          // or have it stored on the snapshotted test. For now, let's use a placeholder value.
          return testTotal + 75; // Placeholder price per test
      }, 0);
      return sampleTotal + testsTotal;
  }, 0);


  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <ClipboardList className="size-10 text-muted-foreground" />
          <div>
            <h1 className="font-headline text-3xl font-semibold">
              Order {id}
            </h1>
            <p className="text-muted-foreground">
              Patient:{' '}
              <Link
                href={`/patients/${orderDetails.patientId}`}
                className="text-primary hover:underline"
              >
                {orderDetails.patientDetails.fullName} (MRN: {orderDetails.patientDetails.mrn})
              </Link>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
            <Button variant="outline"><Printer className="mr-2 h-4 w-4" /> Print Label</Button>
             <Button><Save className="mr-2 h-4 w-4" /> Save Changes</Button>
        </div>
      </div>

        {orderDetails.samples.map((sample, index) => (
            <Card key={sample.accessionNumber || index}>
                <CardHeader>
                    <CardTitle>Sample {index + 1}: {sample.sampleType}</CardTitle>
                    <CardDescription>
                        Accession Number: {sample.accessionNumber || 'Not yet accessioned'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                        <TableRow>
                            <TableHead>Test Name</TableHead>
                            <TableHead className="w-48">Result</TableHead>
                            <TableHead className="w-32">Unit</TableHead>
                            <TableHead>Reference Range</TableHead>
                            <TableHead className="w-48">Status</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {sample.tests.map((test) => (
                            <TableRow key={test.testCode}>
                            <TableCell className="font-medium">{test.name}</TableCell>
                            <TableCell>
                                <Input
                                defaultValue={test.resultValue}
                                placeholder="Enter result..."
                                />
                            </TableCell>
                            <TableCell>{test.resultUnits}</TableCell>
                            <TableCell>{test.referenceRange}</TableCell>
                            <TableCell>
                                <Select defaultValue={test.status}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Update status" />
                                </SelectTrigger>
                                <SelectContent>
                                    {statuses.map((status) => (
                                    <SelectItem key={status} value={status}>
                                        {status}
                                    </SelectItem>
                                    ))}
                                </SelectContent>
                                </Select>
                            </TableCell>
                            </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        ))}
      
       <Card>
        <CardHeader>
            <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-4">
             <div>
              <p className="text-sm font-medium text-muted-foreground">Order Date</p>
              <p>{format(new Date(orderDetails.createdAt), 'yyyy-MM-dd')}</p>
            </div>
             <div>
              <p className="text-sm font-medium text-muted-foreground">Referring Doctor</p>
              <p>{orderDetails.physicianId || 'N/A'}</p>
            </div>
             <div>
              <p className="text-sm font-medium text-muted-foreground">Total Amount</p>
              <p>${totalOrderPrice.toFixed(2)}</p>
            </div>
             <div>
              <p className="text-sm font-medium text-muted-foreground">Overall Status</p>
              <div><Badge variant={statusVariant[orderDetails.orderStatus] || 'default'}>{orderDetails.orderStatus}</Badge></div>
            </div>
             <div>
              <p className="text-sm font-medium text-muted-foreground">Payment Status</p>
              <div><Badge variant="destructive">Unpaid</Badge></div>
            </div>
        </CardContent>
       </Card>

    </div>
  );
}
