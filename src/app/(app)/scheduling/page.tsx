
'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { PlaceHolderImages }from '@/lib/images';
import { cn } from '@/lib/utils';
import { CalendarClock, ChevronLeft, ChevronRight } from 'lucide-react';
import React from 'react';

const timeSlots = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00'
];

const appointments = [
    {
        patientName: 'Fahad Al-Ghamdi',
        time: '09:00',
        duration: 60, // minutes
        status: 'Arrived/Checked-in',
        avatarId: 'user-avatar-1'
    },
    {
        patientName: 'Sarah Khan',
        time: '10:30',
        duration: 30, // minutes
        status: 'Scheduled',
         avatarId: 'user-avatar-1'
    },
    {
        patientName: 'Mohammed Al-Zahrani',
        time: '14:00',
        duration: 90, // minutes
        status: 'Completed',
         avatarId: 'user-avatar-1'
    },
];

const statusColors: {[key: string]: string} = {
    'Scheduled': 'bg-blue-500/20 border-blue-500 text-blue-800 dark:text-blue-300',
    'Arrived/Checked-in': 'bg-green-500/20 border-green-500 text-green-800 dark:text-green-300',
    'Completed': 'bg-gray-500/20 border-gray-500 text-gray-800 dark:text-gray-400',
    'No-show': 'bg-red-500/20 border-red-500 text-red-800 dark:text-red-300',
}

export default function SchedulingPage() {
   const userAvatar = PlaceHolderImages.find(
    (img) => img.id === 'user-avatar-1'
  );

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
          <div className="flex items-center justify-between">
            <div>
                <CardTitle>Appointment Calendar</CardTitle>
                <CardDescription>
                    Drag and drop to reschedule, click a slot to book.
                </CardDescription>
            </div>
            <div className="flex items-center gap-2">
                <Button variant="outline" size="icon"><ChevronLeft /></Button>
                <Button variant="outline" className="w-48">Today</Button>
                <Button variant="outline" size="icon"><ChevronRight /></Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative grid grid-cols-[auto_1fr] h-[70vh] overflow-y-auto rounded-lg border">
            {/* Time column */}
            <div className="flex flex-col border-r">
                {timeSlots.map(time => (
                    <div key={time} className="h-16 flex-shrink-0">
                        <div className="-translate-y-1/2 px-2 text-right">
                            <span className="text-xs text-muted-foreground">{time}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Calendar grid */}
            <div className="relative col-start-2 row-start-1">
                 {/* Grid lines */}
                {timeSlots.map(time => (
                    <div key={`grid-${time}`} className="h-16 border-b" />
                ))}

                {/* Appointments */}
                {appointments.map(app => {
                    const top = timeSlots.indexOf(app.time) * 4; // 4rem per hour
                    const height = (app.duration / 30) * 2; // 2rem per 30 mins
                    return (
                        <div key={app.patientName} 
                             className={cn(
                                "absolute left-2 right-2 p-3 rounded-lg border cursor-pointer",
                                statusColors[app.status] || 'bg-gray-500/20'
                             )}
                             style={{ top: `${top}rem`, height: `${height}rem`}}>
                            <div className="flex items-start gap-3">
                                <Avatar className="h-8 w-8">
                                    {userAvatar && <AvatarImage src={userAvatar.imageUrl} data-ai-hint={userAvatar.imageHint}/>}
                                    <AvatarFallback>{app.patientName.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="min-w-0">
                                    <p className="font-medium truncate">{app.patientName}</p>
                                    <p className="text-sm">{app.time}</p>
                                    <Badge className="mt-1 opacity-80" variant="secondary">{app.status}</Badge>
                                </div>
                            </div>
                        </div>
                    );
                })}

            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
