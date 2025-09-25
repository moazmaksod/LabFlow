
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
import { Label } from '@/components/ui/label';
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
import { Separator } from '@/components/ui/separator';
import { ClipboardList, Printer, Save } from 'lucide-react';
import Link from 'next/link';

const orderDetails = {
  id: 'ORD-002',
  date: '2024-05-21',
  patient: {
    id: 'PAT-002',
    name: 'Jane Smith',
  },
  doctor: 'Dr. Jones',
  status: 'In-Progress',
  tests: [
    {
      id: 'TSH',
      name: 'Thyroid Stimulating Hormone (TSH)',
      status: 'Completed',
      result: '2.5',
      unit: 'mIU/L',
      range: '0.4-4.0',
    },
    {
      id: 'T3',
      name: 'Total T3',
      status: 'In-Progress',
      result: '',
      unit: 'ng/dL',
      range: '80-220',
    },
    {
      id: 'T4',
      name: 'Total T4',
      status: 'In-Progress',
      result: '',
      unit: 'μg/dL',
      range: '4.5-12.5',
    },
  ],
  total: 'SAR 250.00',
  paymentStatus: 'Unpaid',
};

const statusVariant: { [key: string]: 'default' | 'secondary' | 'outline' } = {
  Completed: 'default',
  'In-Progress': 'secondary',
  'Awaiting Validation': 'outline',
};
const statuses = ['In-Progress', 'Awaiting Validation', 'Completed'];

export default function OrderDetailsPage({ params }: { params: { id: string } }) {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <ClipboardList className="size-10 text-muted-foreground" />
          <div>
            <h1 className="font-headline text-3xl font-semibold">
              Order {params.id}
            </h1>
            <p className="text-muted-foreground">
              Patient:{' '}
              <Link
                href={`/patients/${orderDetails.patient.id}`}
                className="text-primary hover:underline"
              >
                {orderDetails.patient.name} ({orderDetails.patient.id})
              </Link>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
            <Button variant="outline"><Printer className="mr-2 h-4 w-4" /> Print Label</Button>
             <Button><Save className="mr-2 h-4 w-4" /> Save Changes</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Test Results</CardTitle>
          <CardDescription>
            Enter and validate results for the tests in this order.
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
              {orderDetails.tests.map((test) => (
                <TableRow key={test.id}>
                  <TableCell className="font-medium">{test.name}</TableCell>
                  <TableCell>
                    <Input
                      defaultValue={test.result}
                      placeholder="Enter result..."
                    />
                  </TableCell>
                  <TableCell>{test.unit}</TableCell>
                  <TableCell>{test.range}</TableCell>
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
      
       <Card>
        <CardHeader>
            <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-4">
             <div>
              <p className="text-sm font-medium text-muted-foreground">Order Date</p>
              <p>{orderDetails.date}</p>
            </div>
             <div>
              <p className="text-sm font-medium text-muted-foreground">Referring Doctor</p>
              <p>{orderDetails.doctor}</p>
            </div>
             <div>
              <p className="text-sm font-medium text-muted-foreground">Total Amount</p>
              <p>{orderDetails.total}</p>
            </div>
             <div>
              <p className="text-sm font-medium text-muted-foreground">Overall Status</p>
              <div><Badge variant={statusVariant[orderDetails.status] || 'default'}>{orderDetails.status}</Badge></div>
            </div>
             <div>
              <p className="text-sm font-medium text-muted-foreground">Payment Status</p>
              <div><Badge variant="destructive">{orderDetails.paymentStatus}</Badge></div>
            </div>
        </CardContent>
       </Card>

    </div>
  );
}
