
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

const orders = [
  {
    id: 'ORD-001',
    patient: 'John Doe',
    doctor: 'Dr. Smith',
    date: '2024-05-20',
    total: 'SAR 150.00',
    status: 'Completed',
  },
  {
    id: 'ORD-002',
    patient: 'Jane Smith',
    doctor: 'Dr. Jones',
    date: '2024-05-21',
    total: 'SAR 250.00',
    status: 'In-Progress',
  },
  {
    id: 'ORD-003',
    patient: 'Alice Johnson',
    doctor: 'Dr. Brown',
    date: '2024-05-21',
    total: 'SAR 75.00',
    status: 'Awaiting Sample',
  },
  {
    id: 'ORD-004',
    patient: 'Bob Williams',
    doctor: 'Dr. White',
    date: '2024-05-22',
    total: 'SAR 320.00',
    status: 'Sample Collected',
  },
  {
    id: 'ORD-005',
    patient: 'Charlie Brown',
    doctor: 'Dr. Green',
    date: '2024-05-22',
    total: 'SAR 500.00',
    status: 'Awaiting Validation',
  },
];

const statusVariant: { [key: string]: 'default' | 'secondary' | 'outline' | 'destructive' } = {
    'Completed': 'default',
    'In-Progress': 'secondary',
    'Awaiting Sample': 'outline',
    'Sample Collected': 'secondary',
    'Awaiting Validation': 'outline'
};


export default function OrdersPage() {
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
                <TableHead>Referring Doctor</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Total Price</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">
                     <Link href={`/orders/${order.id}`} className="text-primary hover:underline">
                        {order.id}
                    </Link>
                  </TableCell>
                  <TableCell>{order.patient}</TableCell>
                  <TableCell>{order.doctor}</TableCell>
                  <TableCell>{order.date}</TableCell>
                  <TableCell>{order.total}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[order.status] || 'default'}>{order.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
