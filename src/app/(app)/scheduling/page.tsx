
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { CalendarClock } from 'lucide-react';

export default function SchedulingPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-4">
        <CalendarClock className="size-10 text-muted-foreground" />
        <div>
          <h1 className="font-headline text-3xl font-semibold">Scheduling</h1>
          <p className="text-muted-foreground">
            Manage phlebotomy appointments and patient flow.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Appointment Calendar</CardTitle>
          <CardDescription>
            View daily and weekly schedules at a glance.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-96 items-center justify-center rounded-lg border-2 border-dashed bg-muted/50 p-4">
            <p className="text-center text-muted-foreground">
              Interactive calendar component will be implemented here.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
