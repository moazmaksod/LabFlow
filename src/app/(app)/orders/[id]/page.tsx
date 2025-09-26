
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
import { ClipboardList, Printer, Save, CreditCard, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import type { Order } from '@/lib/schemas/order';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { useParams } from 'next/navigation';
import { RequisitionForm } from '@/components/label/requisition-form';
import { renderToString } from 'react-dom/server';
import { SampleLabel } from '@/components/label/sample-label';


const statusVariant: { [key: string]: 'default' | 'secondary' | 'outline' } = {
  Completed: 'default',
  'In-Progress': 'secondary',
  'Awaiting Validation': 'outline',
  'Pending': 'outline',
  'Verified': 'default',
};
const paymentStatusVariant: { [key: string]: 'default' | 'destructive' | 'outline' } = {
  'Paid': 'default',
  'Unpaid': 'destructive',
  'Waived': 'outline',
};
const statuses = ['In-Progress', 'AwaitingVerification', 'Verified', 'Cancelled'];

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
    }
}

export default function OrderDetailsPage() {
  const params = useParams();
  const id = params.id as string;
  const { user, token } = useAuth();
  const { toast } = useToast();
  const [orderDetails, setOrderDetails] = useState<OrderWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const canEditResults = user?.role === 'technician' || user?.role === 'manager';
  const isReceptionist = user?.role === 'receptionist';


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

  const handlePrint = (type: 'requisition' | 'label', barcodeValue: string) => {
    if (!orderDetails) return;

    const printWindow = window.open('', '_blank', 'width=800,height=900');
    if (!printWindow) {
      toast({ variant: 'destructive', title: 'Could not open print window. Please disable pop-up blockers.' });
      return;
    }

    let printContent: string;
    if (type === 'requisition') {
        printContent = renderToString(<RequisitionForm order={orderDetails} />);
    } else {
        const sample = orderDetails.samples.find(s => s.accessionNumber === barcodeValue);
        if (!sample) {
            toast({ variant: 'destructive', title: 'Sample not found for label printing.' });
            return;
        }
        printContent = renderToString(
            <SampleLabel
                patientName={orderDetails.patientDetails.fullName}
                mrn={orderDetails.patientDetails.mrn}
                orderId={orderDetails.orderId}
                barcodeValue={barcodeValue}
                sampleType={sample.sampleType}
                isRequisition={false}
            />
        );
    }
    
    const pageTitle = type === 'requisition' ? `Requisition - ${orderDetails.orderId}` : `Label - ${barcodeValue}`;

    printWindow.document.write(`
        <html>
            <head>
                <title>${pageTitle}</title>
                <script src="https://cdn.tailwindcss.com"></script>
                <style>
                    body { font-family: sans-serif; }
                    @media print {
                        @page { size: A4; margin: 0; }
                        body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    }
                </style>
            </head>
            <body class="bg-gray-100 flex items-center justify-center">
                ${printContent}
            </body>
        </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    // Use a timeout to ensure content is fully loaded before printing
    setTimeout(() => {
        printWindow.print();
        printWindow.close();
    }, 500);
  };
  
  const handleMarkAsPaid = async () => {
      // In a real app this would call a PUT endpoint to update the order.
      // For this prototype, we'll just optimistically update the UI.
      if (orderDetails) {
          setOrderDetails({ ...orderDetails, paymentStatus: 'Paid' });
          toast({
              title: "Payment Recorded",
              description: `Order ${orderDetails.orderId} marked as Paid.`,
          });
      }
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
              <Button onClick={() => handlePrint('requisition', orderDetails.orderId)}>
                <Printer className="mr-2 h-4 w-4" /> Print Requisition
              </Button>
            )}
             {!isReceptionist && <Button><Save className="mr-2 h-4 w-4" /> Save Changes</Button>}
        </div>
      </div>

        {orderDetails.samples.map((sample, index) => (
            <Card key={sample.accessionNumber || index}>
                <CardHeader>
                  <div className='flex justify-between items-start'>
                    <div>
                      <CardTitle>Sample {index + 1}: {sample.sampleType}</CardTitle>
                      <CardDescription>
                          Accession Number: {sample.accessionNumber || 'Not yet accessioned'}
                      </CardDescription>
                    </div>
                    {!isReceptionist && (
                      <Button 
                        variant="outline"
                        disabled={!sample.accessionNumber}
                        onClick={() => handlePrint('label', sample.accessionNumber!)}
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
        <CardContent className="grid md:grid-cols-3 gap-4">
             <div>
              <p className="text-sm font-medium text-muted-foreground">Order Date</p>
              <p>{format(new Date(orderDetails.createdAt), 'MMMM d, yyyy')}</p>
            </div>
             <div>
              <p className="text-sm font-medium text-muted-foreground">Referring Doctor</p>
              <p>{orderDetails.physicianDetails?.fullName || 'N/A'}</p>
            </div>
             <div>
              <p className="text-sm font-medium text-muted-foreground">Total Amount</p>
              <p className="font-semibold text-lg">${totalOrderPrice.toFixed(2)}</p>
            </div>
             <div>
              <p className="text-sm font-medium text-muted-foreground">Overall Status</p>
              <div><Badge variant={statusVariant[orderDetails.orderStatus] || 'default'}>{orderDetails.orderStatus}</Badge></div>
            </div>
             <div>
              <p className="text-sm font-medium text-muted-foreground">Payment Status</p>
              <div className="flex items-center gap-2">
                 <Badge variant={paymentStatusVariant[orderDetails.paymentStatus] || 'destructive'}>{orderDetails.paymentStatus}</Badge>
                 {isReceptionist && orderDetails.paymentStatus === 'Unpaid' && (
                     <Button size="sm" variant="outline" onClick={handleMarkAsPaid}>
                        <CreditCard className="mr-2 h-4 w-4" /> Record Payment
                    </Button>
                 )}
                  {orderDetails.paymentStatus === 'Paid' && (
                     <div className="text-sm text-green-600 flex items-center gap-1">
                        <CheckCircle className="h-4 w-4" /> Paid
                    </div>
                 )}
              </div>
            </div>
        </CardContent>
       </Card>

    </div>
  );
}
