
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

// This is a placeholder for the full scheduling component that will be built.
// For now, it provides a summary and quick actions for the receptionist.

export function ReceptionistDashboard() {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-headline text-3xl font-semibold">Receptionist Dashboard</h1>
      <Card>
        <CardHeader>
          <CardTitle>Today's Appointments</CardTitle>
          <CardDescription>
            A summary of today's patient schedule.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="p-8 text-center border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground">The full appointment calendar will be displayed here.</p>
                <Button className="mt-4" onClick={() => router.push('/scheduling')}>
                    Go to Full Calendar
                </Button>
            </div>
            <div className="flex gap-4">
                <Button className="flex-1" size="lg" onClick={() => router.push('/patients/new')}>
                    <PlusCircle className="mr-2" />
                    Register New Patient
                </Button>
                 <Button className="flex-1" size="lg" variant="outline" onClick={() => router.push('/orders/new')}>
                    <PlusCircle className="mr-2" />
                    Create New Order
                </Button>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
