

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
import { FileText, User } from 'lucide-react';

const patient = {
  id: 'PAT-001',
  name: 'John Doe',
  dob: '1985-04-12',
  gender: 'Male',
  phone: '+966 50 123 4567',
  nationalId: '1234567890',
  address: '123 Main St, Riyadh, Saudi Arabia',
};

const pastOrders = [
  {
    id: 'ORD-001',
    date: '2024-05-20',
    tests: 'CBC, Lipid Profile',
    status: 'Completed',
  },
  {
    id: 'ORD-015',
    date: '2023-11-10',
    tests: 'Glucose (Random)',
    status: 'Completed',
  },
];

export default function PatientDetailsPage({ params }: { params: { id: string } }) {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-4">
        <User className="size-10 text-muted-foreground" />
        <div>
          <h1 className="font-headline text-3xl font-semibold">{patient.name}</h1>
          <p className="text-muted-foreground">Patient ID: {params.id}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Patient Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Date of Birth
              </p>
              <p>{patient.dob}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Gender
              </p>
              <p>{patient.gender}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Phone Number
              </p>
              <p>{patient.phone}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                National ID
              </p>
              <p>{patient.nationalId}</p>
            </div>
            <div className="col-span-2">
              <p className="text-sm font-medium text-muted-foreground">
                Address
              </p>
              <p>{patient.address}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Order History</CardTitle>
          <CardDescription>
            A list of all past lab orders for this patient.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Tests Ordered</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pastOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.id}</TableCell>
                  <TableCell>{order.date}</TableCell>
                  <TableCell>{order.tests}</TableCell>
                  <TableCell>
                    <Badge>{order.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm">
                      <FileText className="mr-2 h-4 w-4" />
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
