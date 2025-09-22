
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
import { Download, FileText, Loader, Search, Calendar as CalendarIcon, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import type { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

const completedOrders = [
  {
    id: 'ORD-001',
    patient: 'John Doe',
    tests: 'CBC, Lipid Profile',
    completionDate: '2024-05-21',
    doctor: 'Dr. Smith',
    status: 'Completed',
  },
  {
    id: 'ORD-005',
    patient: 'Charlie Brown',
    tests: 'Full Panel',
    completionDate: '2024-05-23',
    doctor: 'Dr. Green',
    status: 'Completed',
  },
  {
    id: 'ORD-008',
    patient: 'Diana Prince',
    tests: 'Hormone Panel',
    completionDate: '2024-05-23',
    doctor: 'Dr. Trevor',
    status: 'Completed',
  },
  {
    id: 'ORD-002',
    patient: 'Jane Smith',
    tests: 'TSH, T3, T4',
    completionDate: '',
    doctor: 'Dr. Jones',
    status: 'Pending',
  },
];

const statusVariant: {
  [key: string]: 'default' | 'secondary' | 'outline' | 'destructive';
} = {
  Completed: 'default',
  Pending: 'secondary',
};

export default function ResultsPage() {
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(),
    to: new Date(),
  });

  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-headline text-3xl font-semibold">Results</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Results</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-muted-foreground">
              in the selected period
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pending</CardTitle>
            <Loader className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-muted-foreground">
              awaiting completion
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Completed
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              in the selected period
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Generate Results</CardTitle>
          <CardDescription>
            Find completed orders and generate printable PDF results.
          </CardDescription>
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center pt-4">
              <div className="relative flex-grow w-full">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                placeholder="Search by patient or order ID..."
                className="pl-8 w-full"
                />
              </div>
            <div className="flex gap-2 w-full flex-col sm:flex-row md:w-auto">
                 <Popover>
                    <PopoverTrigger asChild>
                    <Button
                        id="date"
                        variant={"outline"}
                        className={cn(
                        "w-full sm:w-auto justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date?.from ? (
                        date.to ? (
                            <>
                            {format(date.from, "LLL dd, y")} -{" "}
                            {format(date.to, "LLL dd, y")}
                            </>
                        ) : (
                            format(date.from, "LLL dd, y")
                        )
                        ) : (
                        <span>Pick a date range</span>
                        )}
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                    <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={date?.from}
                        selected={date}
                        onSelect={setDate}
                        numberOfMonths={2}
                    />
                    </PopoverContent>
                </Popover>
                 <Select>
                  <SelectTrigger className="w-full sm:w-[150px]">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
                 <Input
                placeholder="Filter by test name..."
                className="w-full sm:w-auto"
                />
            </div>
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
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {completedOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium font-code">{order.id}</TableCell>
                  <TableCell>{order.patient}</TableCell>
                  <TableCell>{order.tests}</TableCell>
                  <TableCell>{order.completionDate || 'N/A'}</TableCell>
                  <TableCell>{order.doctor}</TableCell>
                  <TableCell>
                     <Badge variant={statusVariant[order.status]}>
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" disabled={order.status !== 'Completed'}>
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
