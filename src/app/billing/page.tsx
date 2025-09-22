
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Search, FileDown } from 'lucide-react';

const billingData = [
  {
    orderId: 'ORD-001',
    patient: 'John Doe',
    date: '2024-05-20',
    amount: 'SAR 150.00',
    status: 'Paid',
    invoiceId: 'INV-2024-001',
  },
  {
    orderId: 'ORD-002',
    patient: 'Jane Smith',
    date: '2024-05-21',
    amount: 'SAR 250.00',
    status: 'Unpaid',
    invoiceId: 'INV-2024-002',
  },
  {
    orderId: 'ORD-003',
    patient: 'Alice Johnson',
    date: '2024-05-21',
    amount: 'SAR 75.00',
    status: 'Paid',
    invoiceId: 'INV-2024-003',
  },
  {
    orderId: 'ORD-004',
    patient: 'Bob Williams',
    date: '2024-05-22',
    amount: 'SAR 320.00',
    status: 'Unpaid',
    invoiceId: 'INV-2024-004',
  },
  {
    orderId: 'ORD-005',
    patient: 'Charlie Brown',
    date: '2024-05-22',
    amount: 'SAR 500.00',
    status: 'Paid',
    invoiceId: 'INV-2024-005',
  },
];

const statusVariant: {
  [key: string]: 'default' | 'secondary' | 'outline' | 'destructive';
} = {
  Paid: 'secondary',
  Unpaid: 'destructive',
};

export default function BillingPage() {
  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-headline text-3xl font-semibold">Billing</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <span className="text-muted-foreground">SAR</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">725.00</div>
            <p className="text-xs text-muted-foreground">
              from 3 paid invoices
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Outstanding Revenue
            </CardTitle>
            <span className="text-muted-foreground">SAR</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">570.00</div>
            <p className="text-xs text-muted-foreground">
              from 2 unpaid invoices
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
          <CardDescription>
            View and manage all financial transactions.
          </CardDescription>
          <div className="relative pt-4">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by patient, order ID, or invoice ID..."
              className="pl-8"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Invoice ID</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {billingData.map((item) => (
                <TableRow key={item.orderId}>
                  <TableCell className="font-medium font-code">
                    {item.orderId}
                  </TableCell>
                  <TableCell className="font-code">{item.invoiceId}</TableCell>
                  <TableCell>{item.patient}</TableCell>
                  <TableCell>{item.date}</TableCell>
                  <TableCell>{item.amount}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[item.status]}>
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm">
                      <FileDown className="mr-2 h-4 w-4" />
                      Invoice
                    </Button>
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
