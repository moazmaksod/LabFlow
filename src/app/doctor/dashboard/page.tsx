
'use client';
import { Badge } from '@/components/ui/badge';
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
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

const referredPatients = [
  {
    patientId: 'PAT-001',
    patientName: 'John Doe',
    lastOrderDate: '2024-05-20',
    status: 'Result Ready',
    orderId: 'ORD-001',
  },
  {
    patientId: 'PAT-002',
    patientName: 'Jane Smith',
    lastOrderDate: '2024-05-21',
    status: 'In-Progress',
    orderId: 'ORD-002',
  },
  {
    patientId: 'PAT-008',
    patientName: 'Clark Kent',
    lastOrderDate: '2024-05-24',
    status: 'Awaiting Sample',
    orderId: 'ORD-012',
  },
];

const statusVariant: { [key: string]: 'default' | 'secondary' | 'outline' | 'destructive' } = {
    'Result Ready': 'default',
    'In-Progress': 'secondary',
    'Awaiting Sample': 'outline',
};

export default function DoctorDashboardPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="font-headline text-3xl font-semibold">
          Doctor Dashboard
        </h1>
        <p className="text-muted-foreground">Welcome, Dr. Smith</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Referred Patients</CardTitle>
          <CardDescription>
            A list of your patients with recent or pending lab orders.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient ID</TableHead>
                <TableHead>Patient Name</TableHead>
                <TableHead>Last Order Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {referredPatients.map((patient) => (
                <TableRow key={patient.patientId}>
                  <TableCell className="font-medium font-code">
                    {patient.patientId}
                  </TableCell>
                  <TableCell>{patient.patientName}</TableCell>
                  <TableCell>{patient.lastOrderDate}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[patient.status] || 'default'}>
                      {patient.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={patient.status !== 'Result Ready'}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      View Report
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

