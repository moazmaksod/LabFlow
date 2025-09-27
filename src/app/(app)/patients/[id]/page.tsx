
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { FileText, User, PlusCircle, Users, DollarSign } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { Patient } from '@/lib/schemas/patient';
import type { Order } from '@/lib/schemas/order';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import Link from 'next/link';

type OrderWithDetails = Order & {
    patientDetails?: {
        _id: string;
        fullName: string;
        mrn: string;
    }
}

type PatientWithOrders = Patient & {
  orders: OrderWithDetails[];
  guaranteedOrders?: OrderWithDetails[];
}

const paymentStatusVariant: { [key: string]: 'default' | 'destructive' | 'outline' | 'secondary' } = {
  'Paid': 'default',
  'Unpaid': 'destructive',
  'Partially Paid': 'secondary',
  'Waived': 'outline',
};

const calculateOrderBalance = (order: Order) => {
    const total = order.samples.reduce((acc, s) => acc + s.tests.reduce((tAcc, t) => tAcc + (t.price || 0), 0), 0);
    const paid = (order.payments || []).reduce((acc, p) => acc + p.amount, 0);
    return total - paid;
}

export default function PatientDetailsPage() {
    const params = useParams();
    const id = params.id as string;
    const { token } = useAuth();
    const { toast } = useToast();
    const router = useRouter();

    const [patientData, setPatientData] = useState<PatientWithOrders | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    
    useEffect(() => {
        if (!id || !token) return;

        const fetchPatientDetails = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(`/api/v1/patients/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (response.ok) {
                    const result = await response.json();
                    setPatientData(result.data);
                } else {
                    toast({
                        variant: 'destructive',
                        title: 'Failed to fetch patient data',
                        description: 'Could not find the specified patient.'
                    });
                }
            } catch (error) {
                 toast({
                    variant: 'destructive',
                    title: 'Network Error',
                    description: 'Could not connect to the server.'
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchPatientDetails();
    }, [id, token, toast]);

    const financialSummary = useMemo(() => {
        if (!patientData) return { totalDue: 0, ordersWithBalance: [] };
        
        // Orders where the current patient is financially responsible for themselves
        const selfOrdersWithBalance = (patientData.orders || [])
            .filter(order => !order.responsibleParty && order.paymentStatus !== 'Waived')
            .map(order => ({ ...order, balance: calculateOrderBalance(order), isGuaranteed: false }))
            .filter(order => order.balance > 0);

        // Orders where the current patient is the guarantor for someone else
        const guaranteedOrdersWithBalance = (patientData.guaranteedOrders || [])
            .filter(order => order.paymentStatus !== 'Waived')
            .map(order => ({ ...order, balance: calculateOrderBalance(order), isGuaranteed: true }))
            .filter(order => order.balance > 0);

        const allOrdersWithBalance = [...selfOrdersWithBalance, ...guaranteedOrdersWithBalance];
        const totalDue = allOrdersWithBalance.reduce((acc, order) => acc + order.balance, 0);
        
        return {
            totalDue,
            ordersWithBalance: allOrdersWithBalance,
        }
    }, [patientData]);

    const formatDateSafe = (date: any) => {
        try {
            if (!date) return 'N/A';
            return format(new Date(date), 'yyyy-MM-dd');
        } catch {
            return 'Invalid Date';
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
             <Skeleton className="h-64 w-full" />
             <Skeleton className="h-48 w-full" />
        </div>
    )
  }

  if (!patientData) {
     return (
      <div className="text-center">
        <h1 className="text-2xl font-bold">Patient Not Found</h1>
        <p className="text-muted-foreground">The patient with ID {id} could not be found.</p>
        <Button asChild className="mt-4">
            <Link href="/patients">Back to Patient List</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-4">
        <User className="size-10 text-muted-foreground" />
        <div>
          <h1 className="font-headline text-3xl font-semibold">{patientData.fullName}</h1>
          <p className="text-muted-foreground">MRN: {patientData.mrn}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
            <Card>
                <CardHeader>
                <CardTitle>Patient Information</CardTitle>
                </CardHeader>
                <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                    <div>
                    <p className="text-sm font-medium text-muted-foreground">
                        Date of Birth
                    </p>
                    <p>{formatDateSafe(patientData.dateOfBirth)}</p>
                    </div>
                    <div>
                    <p className="text-sm font-medium text-muted-foreground">
                        Gender
                    </p>
                    <p>{patientData.gender}</p>
                    </div>
                    <div>
                    <p className="text-sm font-medium text-muted-foreground">
                        Phone Number
                    </p>
                    <p>{patientData.contactInfo.phone}</p>
                    </div>
                    <div>
                    <p className="text-sm font-medium text-muted-foreground">
                        Email Address
                    </p>
                    <p>{patientData.contactInfo.email || 'N/A'}</p>
                    </div>
                    <div className="col-span-full">
                    <p className="text-sm font-medium text-muted-foreground">
                        Address
                    </p>
                    <p>{`${patientData.contactInfo.address.street}, ${patientData.contactInfo.address.city}, ${patientData.contactInfo.address.state} ${patientData.contactInfo.address.zipCode}`}</p>
                    </div>
                </div>
                </CardContent>
            </Card>
        </div>
        <div className="lg:col-span-1">
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><DollarSign className="h-5 w-5" /> Financial Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Amount Due</p>
                        <p className={`font-bold text-2xl ${financialSummary.totalDue > 0 ? 'text-destructive' : 'text-green-600'}`}>
                            ${financialSummary.totalDue.toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground">Includes balance for self and guaranteed accounts.</p>
                    </div>
                    {financialSummary.ordersWithBalance.length > 0 && (
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Orders with Balance</p>
                            <ul className="space-y-1 mt-1 text-sm">
                                {financialSummary.ordersWithBalance.map(order => (
                                    <li key={order._id} className="flex justify-between items-center">
                                        <Link href={`/orders/${order.orderId}`} className="text-primary hover:underline font-code">
                                            {order.orderId}
                                        </Link>
                                        <div className='text-right'>
                                            <span className="font-medium">${order.balance.toFixed(2)}</span>
                                            {order.isGuaranteed && order.patientDetails && (
                                                <p className='text-xs text-muted-foreground truncate max-w-28'>For {order.patientDetails.fullName}</p>
                                            )}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                </CardContent>
             </Card>
        </div>
      </div>
      


      <Card className="lg:col-span-3">
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>Order History</CardTitle>
                <CardDescription>
                    A list of all past lab orders for this patient.
                </CardDescription>
            </div>
            <Button onClick={() => router.push(`/orders/new?patientId=${id}`)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                New Order for Patient
            </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead># of Tests</TableHead>
                <TableHead>Order Status</TableHead>
                <TableHead>Payment Status</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {patientData.orders?.length > 0 ? (
                patientData.orders.map((order) => {
                  const balance = calculateOrderBalance(order);
                  return (
                    <TableRow key={order._id}>
                        <TableCell className="font-medium font-code">{order.orderId}</TableCell>
                        <TableCell>{formatDateSafe(order.createdAt)}</TableCell>
                        <TableCell>{order.samples.reduce((acc, s) => acc + s.tests.length, 0)}</TableCell>
                        <TableCell>
                            <Badge>{order.orderStatus}</Badge>
                        </TableCell>
                        <TableCell>
                            <Badge variant={paymentStatusVariant[order.paymentStatus] || 'secondary'}>{order.paymentStatus}</Badge>
                        </TableCell>
                        <TableCell className={balance > 0 && !order.responsibleParty ? 'text-destructive font-medium' : ''}>
                            ${balance.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right">
                        <Button asChild variant="outline" size="sm">
                            <Link href={`/orders/${order.orderId}`}>
                            <FileText className="mr-2 h-4 w-4" />
                            View Order
                            </Link>
                        </Button>
                        </TableCell>
                    </TableRow>
                  )
                })
              ) : (
                <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                        No order history found for this patient.
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
