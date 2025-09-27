
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
import { PlusCircle, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import type { Order } from '@/lib/schemas/order';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

type OrderWithPatient = Order & {
    patientDetails: {
        _id: string;
        fullName: string;
        mrn: string;
    }
}

const statusVariant: { [key: string]: 'default' | 'secondary' | 'outline' | 'destructive' } = {
    'Completed': 'default',
    'In-Progress': 'secondary',
    'Pending': 'outline',
    'Awaiting Sample': 'outline',
    'Sample Collected': 'secondary',
    'Awaiting Validation': 'outline',
    'Partially Complete': 'secondary'
};

const paymentStatusVariant: { [key: string]: 'default' | 'destructive' | 'outline' | 'secondary' } = {
  'Paid': 'default',
  'Unpaid': 'destructive',
  'Partially Paid': 'secondary',
  'Waived': 'outline',
};


const formatStatus = (status: string) => {
    return status.replace(/([A-Z])/g, ' $1').trim();
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderWithPatient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { token } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!token) return;
    
    const fetchOrders = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/v1/orders', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const result = await response.json();
          setOrders(result.data);
        } else {
          toast({
            variant: 'destructive',
            title: 'Failed to fetch orders',
            description: 'Could not retrieve order data from the server.'
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

    fetchOrders();
  }, [token, toast]);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="font-headline text-3xl font-semibold">Orders</h1>
        <Button asChild>
          <Link href="/orders/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create New Order
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>
            A list of all recent orders placed in the lab.
          </CardDescription>
          <div className="relative pt-4">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search orders by patient, ID, or doctor..." className="pl-8" />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Order Status</TableHead>
                <TableHead>Billing Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                 Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                        <TableCell colSpan={5}><Skeleton className="h-6 w-full" /></TableCell>
                    </TableRow>
                  ))
              ) : orders.length > 0 ? (
                 orders.map((order) => (
                    <TableRow key={order._id}>
                      <TableCell className="font-medium">
                        <Link href={`/orders/${order.orderId}`} className="text-primary hover:underline">
                            {order.orderId}
                        </Link>
                      </TableCell>
                      <TableCell>{order.patientDetails?.fullName || 'N/A'}</TableCell>
                      <TableCell>{format(new Date(order.createdAt), 'yyyy-MM-dd')}</TableCell>
                      <TableCell>
                        <Badge variant={statusVariant[order.orderStatus] || 'default'}>{formatStatus(order.orderStatus)}</Badge>
                      </TableCell>
                       <TableCell>
                        <Badge variant={paymentStatusVariant[order.paymentStatus] || 'default'} className={cn(order.paymentStatus === 'Paid' && 'bg-green-500/80')}>
                          {formatStatus(order.paymentStatus)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
              ) : (
                 <TableRow>
                    <TableCell colSpan={5} className="text-center h-24">
                        No orders found.
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
