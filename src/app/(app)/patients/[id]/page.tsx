
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
import { FileText, User, PlusCircle, Users } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { Patient } from '@/lib/schemas/patient';
import type { Order } from '@/lib/schemas/order';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import Link from 'next/link';

type PatientWithOrders = Patient & {
  orders: Order[];
  guaranteedOrders?: Order[];
  guaranteedPatientDetails?: Patient[];
}

const paymentStatusVariant: { [key: string]: 'default' | 'destructive' | 'outline' | 'secondary' } = {
  'Paid': 'default',
  'Unpaid': 'destructive',
  'Partially Paid': 'secondary',
  'Waived': 'outline',
};

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

    const guarantor = useMemo(() => {
        if (!patientData?.orders?.length) return null;

        for (const order of patientData.orders) {
            if (order.guarantorDetails) {
                return order.guarantorDetails;
            }
        }
        return null;
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

      <Card>
        <CardHeader>
          <CardTitle>Patient Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-y-4 gap-x-8 md:grid-cols-3">
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
                Responsible for Billing
              </p>
               {guarantor ? (
                <Link href={`/patients/${guarantor._id}`} className="text-primary hover:underline">
                    {guarantor.fullName} (MRN: {guarantor.mrn})
                </Link>
               ) : (
                <p>Self</p>
               )}
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Phone Number
              </p>
              <p>{patientData.contactInfo.phone}</p>
            </div>
            <div className="col-span-2">
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
      
       {patientData.guaranteedPatientDetails && patientData.guaranteedPatientDetails.length > 0 && (
          <Card>
            <CardHeader>
                <CardTitle>Bills Responsible For</CardTitle>
                <CardDescription>This patient is the guarantor for the following people.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    {patientData.guaranteedPatientDetails.map(p => (
                         <Link key={p._id} href={`/patients/${p._id}`} className="flex items-center gap-2 p-2 rounded-md hover:bg-accent">
                             <Users className="h-4 w-4 text-muted-foreground" />
                             <div>
                                <p className="font-medium">{p.fullName}</p>
                                <p className="text-sm text-muted-foreground">MRN: {p.mrn}</p>
                             </div>
                         </Link>
                    ))}
                </div>
            </CardContent>
          </Card>
       )}


      <Card>
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
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {patientData.orders?.length > 0 ? (
                patientData.orders.map((order) => (
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
                    <TableCell className="text-right">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/orders/${order.orderId}`}>
                          <FileText className="mr-2 h-4 w-4" />
                          View Order
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
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
