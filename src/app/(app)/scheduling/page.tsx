
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
import React, { useState } from 'react';

const timeSlots = [
  '08:00', '08:15', '08:30', '08:45', '09:00', '09:15', '09:30', '09:45',
  '10:00', '10:15', '10:30', '10:45', '11:00', '11:15', '11:30', '11:45',
  '12:00', '12:15', '12:30', '12:45', '13:00', '13:15', '13:30', '13:45',
  '14:00', '14:15', '14:30', '14:45', '15:00', '15:15', '15:30', '15:45',
  '16:00', '16:15', '16:30', '16:45', '17:00'
];

const initialAppointments = [
    {
        id: 'apt1',
        patientName: 'Fahad Al-Ghamdi',
        time: '09:00',
        duration: 60, // minutes
        status: 'Arrived/Checked-in',
        avatarId: 'user-avatar-1'
    },
    {
        id: 'apt2',
        patientName: 'Sarah Khan',
        time: '10:30',
        duration: 30, // minutes
        status: 'Scheduled',
         avatarId: 'user-avatar-1'
    },
    {
        id: 'apt3',
        patientName: 'Mohammed Al-Zahrani',
        time: '14:00',
        duration: 90, // minutes
        status: 'Completed',
         avatarId: 'user-avatar-1'
    },
    {
        id: 'apt4',
        patientName: 'Omar Abdullah',
        time: '08:15',
        duration: 15,
        status: 'Scheduled',
        avatarId: 'user-avatar-1',
    }
];

const statusColors: {[key: string]: string} = {
    'Scheduled': 'bg-blue-500/20 border-blue-500 text-blue-800 dark:text-blue-300',
    'Arrived/Checked-in': 'bg-green-500/20 border-green-500 text-green-800 dark:text-green-300',
    'Completed': 'bg-gray-500/20 border-gray-500 text-gray-800 dark:text-gray-400',
    'No-show': 'bg-red-500/20 border-red-500 text-red-800 dark:text-red-300',
}

const SLOT_HEIGHT_REM = 4; // Increased from 3.5 to 4

export default function SchedulingPage() {
   const userAvatar = PlaceHolderImages.find(
    (img) => img.id === 'user-avatar-1'
  );
  const [appointments, setAppointments] = useState(initialAppointments);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, appointmentId: string) => {
    e.dataTransfer.setData("appointmentId", appointmentId);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); 
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>, time: string) => {
    e.preventDefault();
    const appointmentId = e.dataTransfer.getData("appointmentId");
    
    setAppointments(prevAppointments => 
      prevAppointments.map(app => 
        app.id === appointmentId ? { ...app, time: time } : app
      )
    );
  };


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
           <div className="flex">
            {/* Time column */}
            <div className="pr-4 text-right">
              {timeSlots.map((time, index) => (
                <div
                  key={time}
                  className="relative flex items-start justify-end text-xs text-muted-foreground"
                  style={{ height: `${SLOT_HEIGHT_REM}rem`}}
                >
                  {time.endsWith(':00') && (
                    <span className="absolute -translate-y-1/2 text-muted-foreground text-xs">{time}</span>
                  )}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="relative grid flex-1 h-full border-l">
                {/* Grid lines as drop zones */}
                {timeSlots.map((time) => (
                    <div 
                      key={`grid-${time}`} 
                      className={cn(
                        "border-t",
                         time.endsWith(':00') ? "border-border" : "border-border/50 border-dashed"
                      )}
                       style={{ height: `${SLOT_HEIGHT_REM}rem`}}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, time)}
                    />
                ))}

                {/* Appointments */}
                {appointments.map(app => {
                    const topIndex = timeSlots.indexOf(app.time);
                    if (topIndex === -1) return null;
                    
                    const heightInSlots = Math.max(app.duration / 15, 1);
                    
                    const topPosition = topIndex * SLOT_HEIGHT_REM;
                    const height = heightInSlots * SLOT_HEIGHT_REM - 0.5; // -0.5rem for margin

                    return (
                        <div key={app.id} 
                             draggable={app.status !== 'Completed'}
                             onDragStart={(e) => handleDragStart(e, app.id)}
                             className={cn(
                                "absolute left-2 right-2 p-2 rounded-lg border flex flex-col items-start",
                                statusColors[app.status] || 'bg-gray-500/20',
                                app.status !== 'Completed' ? "cursor-grab" : "cursor-not-allowed"
                             )}
                             style={{ top: `${topPosition}rem`, height: `${height}rem`, transition: 'top 0.3s ease-out'}}>
                             <div className="flex items-start gap-2 flex-wrap w-full">
                                <Avatar className="h-6 w-6">
                                    {userAvatar && <AvatarImage src={userAvatar.imageUrl} data-ai-hint={userAvatar.imageHint}/>}
                                    <AvatarFallback>{app.patientName.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="min-w-0 flex-grow">
                                    <p className="font-medium truncate text-sm">{app.patientName}</p>
                                    <p className="text-xs">{app.time}</p>
                                </div>
                                <Badge variant="secondary" className="ml-auto opacity-80 whitespace-nowrap self-start flex-shrink-0">{app.status}</Badge>
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
