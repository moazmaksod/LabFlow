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
import { ScanBarcode } from 'lucide-react';

const samples = [
  {
    barcode: 'SMPL-001-A',
    patient: 'John Doe',
    tests: 'CBC, Lipid Profile',
    status: 'In-Progress',
  },
  {
    barcode: 'SMPL-002-A',
    patient: 'Jane Smith',
    tests: 'TSH, T3, T4',
    status: 'Sample Collected',
  },
  {
    barcode: 'SMPL-003-A',
    patient: 'Alice Johnson',
    tests: 'Glucose (Fasting)',
    status: 'Awaiting Sample',
  },
  {
    barcode: 'SMPL-004-A',
    patient: 'Bob Williams',
    tests: 'Vitamin D, Vitamin B12',
    status: 'Awaiting Validation',
  },
  {
    barcode: 'SMPL-005-A',
    patient: 'Charlie Brown',
    tests: 'Full Panel',
    status: 'Completed',
  },
];

const statuses = [
  'Awaiting Sample',
  'Sample Collected',
  'In-Progress',
  'Awaiting Validation',
  'Completed',
];

export default function LabPage() {
  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-headline text-3xl font-semibold">Lab Workflow</h1>

      <Card>
        <CardHeader>
          <CardTitle>Sample Status Tracking</CardTitle>
          <CardDescription>
            Scan a sample barcode to update its status or view its details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex w-full max-w-md items-center space-x-2">
            <div className="relative flex-grow">
              <ScanBarcode className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Scan or enter sample barcode..."
                className="pl-10 text-lg h-12"
              />
            </div>
            <Button size="lg">Update Status</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sample Queue</CardTitle>
          <CardDescription>
            List of samples currently in the lab workflow.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Barcode ID</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Tests</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {samples.map((sample) => (
                <TableRow key={sample.barcode}>
                  <TableCell className="font-medium font-code">
                    {sample.barcode}
                  </TableCell>
                  <TableCell>{sample.patient}</TableCell>
                  <TableCell>{sample.tests}</TableCell>
                  <TableCell>
                    <Select defaultValue={sample.status}>
                      <SelectTrigger className="w-[180px]">
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
    </div>
  );
}
