
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
import { ClipboardList, Printer, Save, CreditCard, CheckCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import type { Order } from '@/lib/schemas/order';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { useParams } from 'next/navigation';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RecordPaymentInput, RecordPaymentSchema } from '@/lib/schemas/order';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const statusVariant: { [key: string]: 'default' | 'secondary' | 'outline' } = {
  Completed: 'default',
  'In-Progress': 'secondary',
  'Awaiting Validation': 'outline',
  'Pending': 'outline',
  'Verified': 'default',
};
const paymentStatusVariant: { [key: string]: 'default' | 'destructive' | 'outline' | 'secondary' } = {
  'Paid': 'default',
  'Unpaid': 'destructive',
  'Partially Paid': 'secondary',
  'Waived': 'outline',
};
const statuses = ['In-Progress', 'AwaitingVerification', 'Verified', 'Cancelled'];

type SampleWithClientId = Order['samples'][0] & { clientId: string };

type OrderWithDetails = Order & {
    patientDetails: {
        _id: string;
        fullName: string;
        mrn: string;
        dateOfBirth: string | Date;
        gender: string;
    };
    physicianDetails?: {
        _id: string;
        fullName: string;
    },
    guarantorDetails?: {
        _id: string;
        fullName: string;
        mrn: string;
    }
    samples: SampleWithClientId[];
}

const RecordPaymentForm = ({ order, onPaymentSuccess }: { order: OrderWithDetails; onPaymentSuccess: (newOrderData: Partial<Order>) => void }) => {
    const { token } = useAuth();
    const { toast } = useToast();
    
    const totalOrderPrice = order.samples.reduce((sampleTotal, sample) => {
        const testsTotal = sample.tests.reduce((testTotal, test) => {
            return testTotal + (test.price || 0);
        }, 0);
        return sampleTotal + testsTotal;
    }, 0);
    const totalPaid = (order.payments || []).reduce((sum, p) => sum + p.amount, 0);
    const balanceDue = totalOrderPrice - totalPaid;

    const form = useForm<RecordPaymentInput>({
        resolver: zodResolver(RecordPaymentSchema),
        defaultValues: {
            amount: balanceDue,
            method: 'Credit Card',
        }
    });

    const onSubmit = async (values: RecordPaymentInput) => {
        try {
            const response = await fetch(`/api/v1/orders/${order.orderId}/payments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(values),
            });

            if (response.ok) {
                const result = await response.json();
                toast({
                    title: "Payment Recorded",
                    description: `$${values.amount.toFixed(2)} recorded successfully.`
                });
                onPaymentSuccess({
                    paymentStatus: result.newStatus,
                    payments: [...(order.payments || []), result.newPayment]
                });
            } else {
                const error = await response.json();
                toast({ variant: 'destructive', title: 'Payment Failed', description: error.message });
            }
        } catch (error) {
            toast({ variant: 'destructive', title: 'Network Error', description: 'Could not connect to the server.' });
        }
    }

    return (
         <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <DialogHeader>
                    <DialogTitle>Record Payment for Order {order.orderId}</DialogTitle>
                    <DialogDescription>
                        Total amount: ${totalOrderPrice.toFixed(2)}. Balance Due: <span className="font-bold">${balanceDue.toFixed(2)}</span>
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <FormField
                        control={form.control}
                        name="amount"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Amount to Pay</FormLabel>
                                <FormControl>
                                    <Input type="number" step="0.01" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="method"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Payment Method</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="Credit Card">Credit Card</SelectItem>
                                        <SelectItem value="Cash">Cash</SelectItem>
                                        <SelectItem value="Other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <DialogFooter>
                    <Button type="submit" disabled={form.formState.isSubmitting}>
                        {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Record Payment
                    </Button>
                </DialogFooter>
            </form>
         </Form>
    );
};


export default function OrderDetailsPage() {
  const params = useParams();
  const id = params.id as string;
  const { user, token } = useAuth();
  const { toast } = useToast();
  const [orderDetails, setOrderDetails] = useState<OrderWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaymentDialogOpen, setPaymentDialogOpen] = useState(false);

  const canEditResults = user?.role === 'technician' || user?.role === 'manager';
  const isReceptionist = user?.role === 'receptionist' || user?.role === 'manager';


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
           // Add a temporary unique identifier to each sample for UI key and printing logic
          const orderWithClientIds: OrderWithDetails = {
              ...result.data,
              samples: result.data.samples.map((s: Order['samples'][0], i: number) => ({...s, clientId: `${result.data.orderId}-S${i}`})),
          };
          setOrderDetails(orderWithClientIds);
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

  const handlePrint = (type: 'requisition' | 'label', sampleClientId?: string) => {
    if (!orderDetails) return;

    let url = `/print/orders/${orderDetails.orderId}`;
    if (type === 'label') {
        if(!sampleClientId) {
            toast({variant: 'destructive', title: 'Sample ID missing for label printing.'})
            return;
        }
      url += `?sampleClientId=${sampleClientId}`;
    }

    window.open(url, '_blank', 'width=800,height=900');
  };
  
  const handlePaymentSuccess = (newOrderData: Partial<Order>) => {
      setOrderDetails(prev => prev ? { ...prev, ...newOrderData } as OrderWithDetails : null);
      setPaymentDialogOpen(false);
  }

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

  const totalOrderPrice = orderDetails.samples.reduce((sampleTotal, sample) => {
      const testsTotal = sample.tests.reduce((testTotal, test) => {
          return testTotal + (test.price || 0); // Use the snapshotted price
      }, 0);
      return sampleTotal + testsTotal;
  }, 0);

  const totalPaid = (orderDetails.payments || []).reduce((sum, p) => sum + p.amount, 0);
  const balanceDue = totalOrderPrice - totalPaid;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <ClipboardList className="size-10 text-muted-foreground" />
          <div>
            <h1 className="font-headline text-3xl font-semibold">
              Order {orderDetails.orderId}
            </h1>
            <p className="text-muted-foreground">
              Patient:{' '}
              <Link
                href={`/patients/${orderDetails.patientId}`}
                className="text-primary hover:underline"
              >
                {orderDetails.patientDetails?.fullName || 'N/A'} (MRN: {orderDetails.patientDetails?.mrn || 'N/A'})
              </Link>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
            {isReceptionist && (
              <Button onClick={() => handlePrint('requisition')}>
                <Printer className="mr-2 h-4 w-4" /> Print Requisition
              </Button>
            )}
             {canEditResults && <Button><Save className="mr-2 h-4 w-4" /> Save Changes</Button>}
        </div>
      </div>

        {orderDetails.samples.map((sample, index) => (
            <Card key={sample.clientId}>
                <CardHeader>
                  <div className='flex justify-between items-start'>
                    <div>
                      <CardTitle>Sample {index + 1}: {sample.sampleType}</CardTitle>
                      <CardDescription>
                          Accession Number: {sample.accessionNumber || 'Not yet accessioned'}
                      </CardDescription>
                    </div>
                     {isReceptionist && (
                        <Button 
                            variant="outline"
                            onClick={() => handlePrint('label', sample.clientId)}
                        >
                            <Printer className="mr-2 h-4 w-4" /> 
                            Print Label
                        </Button>
                     )}
                  </div>
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
                                {canEditResults ? (
                                    <Input
                                    defaultValue={test.resultValue}
                                    placeholder="Enter result..."
                                    />
                                ) : (
                                    <span>{test.resultValue || 'N/A'}</span>
                                )}
                            </TableCell>
                            <TableCell>{test.resultUnits}</TableCell>
                            <TableCell>{test.referenceRange}</TableCell>
                            <TableCell>
                                {canEditResults ? (
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
                                ) : (
                                     <Badge variant={statusVariant[test.status] || 'secondary'}>{test.status}</Badge>
                                )}
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
            <CardTitle>Order Summary & Billing</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-y-4 gap-x-8">
             <div>
              <p className="text-sm font-medium text-muted-foreground">Order Date</p>
              <p>{format(new Date(orderDetails.createdAt), 'MMMM d, yyyy')}</p>
            </div>
             <div>
              <p className="text-sm font-medium text-muted-foreground">Referring Doctor</p>
              <p>{orderDetails.physicianDetails?.fullName || 'N/A'}</p>
            </div>
             <div>
              <p className="text-sm font-medium text-muted-foreground">Responsible Party</p>
               {orderDetails.guarantorDetails ? (
                <Link href={`/patients/${orderDetails.guarantorDetails._id}`} className="text-primary hover:underline">
                    {orderDetails.guarantorDetails.fullName} ({orderDetails.responsibleParty?.relationship})
                </Link>
               ) : (
                <p>Self (Patient)</p>
               )}
            </div>
             <div>
              <p className="text-sm font-medium text-muted-foreground">Billing Type</p>
              <p>{orderDetails.billingType}</p>
            </div>
             <div>
              <p className="text-sm font-medium text-muted-foreground">Total Amount</p>
              <p className="font-semibold text-lg">${totalOrderPrice.toFixed(2)}</p>
            </div>
             <div>
              <p className="text-sm font-medium text-muted-foreground">Amount Paid</p>
              <p className="font-semibold text-lg text-green-600">${totalPaid.toFixed(2)}</p>
            </div>
             <div>
              <p className="text-sm font-medium text-muted-foreground">Balance Due</p>
              <p className="font-semibold text-lg">${balanceDue.toFixed(2)}</p>
            </div>
             <div>
              <p className="text-sm font-medium text-muted-foreground">Overall Status</p>
              <div><Badge variant={statusVariant[orderDetails.orderStatus] || 'default'}>{orderDetails.orderStatus}</Badge></div>
            </div>
             <div className="md:col-span-2">
              <p className="text-sm font-medium text-muted-foreground">Payment Status</p>
              <div className="flex items-center gap-2 mt-1">
                 <Badge variant={paymentStatusVariant[orderDetails.paymentStatus] || 'destructive'}>{orderDetails.paymentStatus}</Badge>
                 {isReceptionist && orderDetails.paymentStatus !== 'Paid' && orderDetails.paymentStatus !== 'Waived' && (
                     <Dialog open={isPaymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm" variant="outline">
                                <CreditCard className="mr-2 h-4 w-4" /> Record Payment
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <RecordPaymentForm order={orderDetails} onPaymentSuccess={handlePaymentSuccess} />
                        </DialogContent>
                     </Dialog>
                 )}
                  {orderDetails.paymentStatus === 'Paid' && (
                     <div className="text-sm text-green-600 flex items-center gap-1">
                        <CheckCircle className="h-4 w-4" /> Fully Paid
                    </div>
                 )}
              </div>
            </div>
        </CardContent>
       </Card>

    </div>
  );
}
