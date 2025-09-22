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
import { Download, Search } from 'lucide-react';

const completedOrders = [
  {
    id: 'ORD-001',
    patient: 'John Doe',
    tests: 'CBC, Lipid Profile',
    completionDate: '2024-05-21',
    doctor: 'Dr. Smith',
  },
  {
    id: 'ORD-005',
    patient: 'Charlie Brown',
    tests: 'Full Panel',
    completionDate: '2024-05-23',
    doctor: 'Dr. Green',
  },
  {
    id: 'ORD-008',
    patient: 'Diana Prince',
    tests: 'Hormone Panel',
    completionDate: '2024-05-23',
    doctor: 'Dr. Trevor',
  },
];

export default function ReportsPage() {
  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-headline text-3xl font-semibold">Reports</h1>

      <Card>
        <CardHeader>
          <CardTitle>Generate Reports</CardTitle>
          <CardDescription>
            Find completed orders and generate printable PDF reports.
          </CardDescription>
          <div className="relative pt-4">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by patient name, order ID, or date..." className="pl-8" />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Tests</TableHead>
                <TableHead>Completion Date</TableHead>
                <TableHead>Referring Doctor</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {completedOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.id}</TableCell>
                  <TableCell>{order.patient}</TableCell>
                  <TableCell>{order.tests}</TableCell>
                  <TableCell>{order.completionDate}</TableCell>
                  <TableCell>{order.doctor}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm">
                      <Download className="mr-2 h-4 w-4" />
                      Generate PDF
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
