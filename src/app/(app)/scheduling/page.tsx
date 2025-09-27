
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
import { CalendarClock, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import type { Appointment } from '@/lib/schemas/appointment';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Patient } from '@/lib/schemas/patient';
import { add, format, startOfDay, sub } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const timeSlots = Array.from({ length: (17 - 8) * 4 }, (_, i) => {
    const hour = 8 + Math.floor(i / 4);
    const minute = (i % 4) * 15;
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
});

const statusColors: {[key: string]: string} = {
    'Scheduled': 'bg-blue-500/20 border-blue-500 text-blue-800 dark:text-blue-300',
    'Arrived/Checked-in': 'bg-green-500/20 border-green-500 text-green-800 dark:text-green-300',
    'Completed': 'bg-gray-500/20 border-gray-500 text-gray-800 dark:text-gray-400',
    'No-show': 'bg-red-500/20 border-red-500 text-red-800 dark:text-red-300',
}

const APPOINTMENT_STATUSES: Appointment['status'][] = ['Scheduled', 'Arrived/Checked-in', 'Completed', 'No-show'];

const SLOT_HEIGHT_REM = 3; // 12 in tailwind units (3 * 4)

type AppointmentWithPatient = Appointment & {
    patientDetails?: {
        _id: string;
        fullName: string;
        mrn: string;
    }
}

const PatientSearch = ({ onSelectPatient }: { onSelectPatient: (patient: Patient) => void }) => {
    const [patientSearchTerm, setPatientSearchTerm] = useState('');
    const [patientSearchResults, setPatientSearchResults] = useState<Patient[]>([]);
    const [isSearchingPatients, setIsSearchingPatients] = useState(false);
    const { token } = useAuth();

    useEffect(() => {
        if (patientSearchTerm.length < 2) {
            setPatientSearchResults([]);
            return;
        }
        const handler = setTimeout(async () => {
            if (!token) return;
            setIsSearchingPatients(true);
            try {
                const response = await fetch(`/api/v1/patients?search=${patientSearchTerm}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (response.ok) {
                    const result = await response.json();
                    setPatientSearchResults(result.data);
                }
            } catch (error) {
                console.error("Failed to search patients", error);
            } finally {
                setIsSearchingPatients(false);
            }
        }, 500);
        return () => clearTimeout(handler);
    }, [patientSearchTerm, token]);

    return (
        <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
                placeholder="Search by Patient Name or MRN..."
                className="pl-8"
                value={patientSearchTerm}
                onChange={(e) => setPatientSearchTerm(e.target.value)}
            />
            {(isSearchingPatients || patientSearchResults.length > 0) && (
                 <div className="absolute z-10 w-full mt-1 bg-card border rounded-md shadow-lg">
                    {isSearchingPatients && <div className="p-2 text-sm text-muted-foreground">Searching...</div>}
                    {patientSearchResults.map(p => (
                        <li key={p._id} onClick={() => { onSelectPatient(p); setPatientSearchTerm(''); setPatientSearchResults([]); }} className="p-2 hover:bg-accent cursor-pointer list-none">
                            <p className="font-medium">{p.fullName}</p>
                            <p className="text-sm text-muted-foreground">MRN: {p.mrn}</p>
                        </li>
                    ))}
                </div>
            )}
        </div>
    );
};


export default function SchedulingPage() {
    const userAvatar = PlaceHolderImages.find((img) => img.id === 'user-avatar-1');
    const { token } = useAuth();
    const { toast } = useToast();

    const [appointments, setAppointments] = useState<AppointmentWithPatient[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentDate, setCurrentDate] = useState(startOfDay(new Date()));
    
    const [isNewAppointmentDialogOpen, setNewAppointmentDialogOpen] = useState(false);
    const [newAppointmentTime, setNewAppointmentTime] = useState('');
    const [selectedPatientForNewAppt, setSelectedPatientForNewAppt] = useState<Patient | null>(null);
    const [newAppointmentDuration, setNewAppointmentDuration] = useState(30);

    const [isEditAppointmentDialogOpen, setEditAppointmentDialogOpen] = useState(false);
    const [editingAppointment, setEditingAppointment] = useState<AppointmentWithPatient | null>(null);

    const fetchAppointments = async (date: Date) => {
        if (!token) return;
        setIsLoading(true);
        const startDate = format(date, 'yyyy-MM-dd');
        const endDate = format(add(date, { days: 1 }), 'yyyy-MM-dd');
        
        try {
            const response = await fetch(`/api/v1/appointments?startDate=${startDate}&endDate=${endDate}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.ok) {
                const result = await response.json();
                setAppointments(result.data.map((a: any) => ({...a, scheduledTime: new Date(a.scheduledTime)})));
            } else {
                toast({ variant: 'destructive', title: 'Failed to fetch appointments.' });
            }
        } catch (error) {
            toast({ variant: 'destructive', title: 'An error occurred while fetching appointments.' });
        } finally {
            setIsLoading(false);
        }
    };
    
    useEffect(() => {
        fetchAppointments(currentDate);
    }, [currentDate, token]);

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, appointmentId: string) => {
        e.dataTransfer.setData("appointmentId", appointmentId);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault(); 
    };
  
    const handleDrop = async (e: React.DragEvent<HTMLDivElement>, time: string) => {
        e.preventDefault();
        const appointmentId = e.dataTransfer.getData("appointmentId");
        
        const [hours, minutes] = time.split(':').map(Number);
        const newScheduledTime = new Date(currentDate);
        newScheduledTime.setHours(hours, minutes, 0, 0);

        // Optimistic UI update
        const originalAppointments = appointments;
        setAppointments(prev => prev.map(app => app._id === appointmentId ? { ...app, scheduledTime: newScheduledTime } : app));

        // API call
        try {
            const response = await fetch(`/api/v1/appointments/${appointmentId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`},
                body: JSON.stringify({ scheduledTime: newScheduledTime.toISOString() })
            });

            if (!response.ok) {
                // Revert on failure
                setAppointments(originalAppointments);
                toast({ variant: "destructive", title: "Failed to reschedule", description: "The appointment could not be updated."});
            } else {
                 toast({ title: "Appointment Rescheduled", description: `Moved to ${time}.` });
            }
        } catch (error) {
            setAppointments(originalAppointments);
            toast({ variant: "destructive", title: "Network Error", description: "Could not update appointment."});
        }
    };
    
    const openNewAppointmentDialog = (time: string) => {
        setNewAppointmentTime(time);
        setSelectedPatientForNewAppt(null);
        setNewAppointmentDuration(30);
        setNewAppointmentDialogOpen(true);
    };

    const handleCreateAppointment = async () => {
        if (!selectedPatientForNewAppt || !newAppointmentTime || !token) return;

        const [hours, minutes] = newAppointmentTime.split(':').map(Number);
        const scheduledDateTime = new Date(currentDate);
        scheduledDateTime.setHours(hours, minutes);

        const newAppointmentPayload = {
            patientId: selectedPatientForNewAppt._id,
            scheduledTime: scheduledDateTime.toISOString(),
            durationMinutes: newAppointmentDuration,
            status: 'Scheduled',
        };

        try {
            const response = await fetch('/api/v1/appointments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(newAppointmentPayload),
            });
            if (response.ok) {
                toast({ title: "Appointment created successfully!" });
                fetchAppointments(currentDate); // Refresh
                setNewAppointmentDialogOpen(false);
            } else {
                 toast({ variant: "destructive", title: "Failed to create appointment" });
            }
        } catch (error) {
             toast({ variant: "destructive", title: "An error occurred." });
        }
    };

    const openEditAppointmentDialog = (appointment: AppointmentWithPatient) => {
        setEditingAppointment(appointment);
        setEditAppointmentDialogOpen(true);
    }
    
    const handleUpdateAppointment = async () => {
        if (!editingAppointment || !token) return;

        try {
            const response = await fetch(`/api/v1/appointments/${editingAppointment._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`},
                body: JSON.stringify({ status: editingAppointment.status })
            });

            if (response.ok) {
                toast({ title: "Appointment Updated" });
                fetchAppointments(currentDate); // Refresh
                setEditAppointmentDialogOpen(false);
            } else {
                 toast({ variant: "destructive", title: "Failed to update appointment"});
            }
        } catch (error) {
            toast({ variant: "destructive", title: "Network Error"});
        }
    };

    const handleDeleteAppointment = async () => {
        if (!editingAppointment || !token) return;
        
        try {
            const response = await fetch(`/api/v1/appointments/${editingAppointment._id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.status === 204) {
                 toast({ title: "Appointment Canceled" });
                 fetchAppointments(currentDate); // Refresh
                 setEditAppointmentDialogOpen(false);
            } else {
                toast({ variant: "destructive", title: "Failed to cancel appointment" });
            }
        } catch (error) {
             toast({ variant: "destructive", title: "Network Error" });
        }
    };


    const handlePreviousDay = () => setCurrentDate(sub(currentDate, { days: 1 }));
    const handleNextDay = () => setCurrentDate(add(currentDate, { days: 1 }));
    const handleGoToToday = () => setCurrentDate(startOfDay(new Date()));
    
    const isToday = format(currentDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');


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
                    Drag and drop to reschedule, click an empty slot to book.
                </CardDescription>
            </div>
            <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={handlePreviousDay}><ChevronLeft /></Button>
                <Button variant="outline" className="w-48" onClick={handleGoToToday}>
                    {isToday ? 'Today' : format(currentDate, 'MMMM d, yyyy')}
                </Button>
                <Button variant="outline" size="icon" onClick={handleNextDay}><ChevronRight /></Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
           <div className="flex w-full">
            {/* Time column */}
            <div className="w-16 pr-2 text-right pt-4">
              {timeSlots.map((time) => {
                if (time.endsWith(':00')) {
                  return (
                    <div
                      key={`label-${time}`}
                      className="relative"
                      style={{ height: `${SLOT_HEIGHT_REM * 4}rem`}}
                    >
                      <span className="absolute -top-2 right-2 text-xs text-muted-foreground">{time}</span>
                    </div>
                  );
                }
                return null;
              })}
            </div>

            {/* Calendar grid */}
            <div className="relative grid flex-1 h-full border-l pt-4">
                {/* Grid lines as drop zones */}
                {timeSlots.map((time) => (
                    <div 
                      key={`grid-${time}`} 
                      className={cn(
                        "border-t hover:bg-accent/50 cursor-pointer",
                         time.endsWith(':00') ? "border-border" : "border-border/50 border-dashed"
                      )}
                       style={{ height: `${SLOT_HEIGHT_REM}rem`}}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, time)}
                      onClick={() => openNewAppointmentDialog(time)}
                      draggable="false"
                      onDragStart={(e) => e.preventDefault()}
                    />
                ))}

                {/* Appointments */}
                {isLoading ? (
                    <div className="absolute inset-0 pt-4 px-2 space-y-2">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-16 w-full" />
                    </div>
                ) : (
                    appointments.map(app => {
                        const scheduledTime = new Date(app.scheduledTime);
                        const appTime = format(scheduledTime, 'HH:mm');
                        const topIndex = timeSlots.indexOf(appTime);
                        if (topIndex === -1) return null;
                        
                        const heightInSlots = Math.max(app.durationMinutes / 15, 1);
                        
                        const topPosition = topIndex * SLOT_HEIGHT_REM;
                        const height = heightInSlots * SLOT_HEIGHT_REM;
                        const isCompact = app.durationMinutes < 30;

                        return (
                            <div key={app._id} 
                                 draggable={app.status !== 'Completed'}
                                 onDragStart={(e) => handleDragStart(e, app._id)}
                                 onClick={() => openEditAppointmentDialog(app)}
                                 className={cn(
                                    "absolute left-2 right-2 p-2 rounded-lg border",
                                    statusColors[app.status] || 'bg-gray-500/20',
                                    app.status !== 'Completed' ? "cursor-grab" : "cursor-not-allowed"
                                 )}
                                 style={{ top: `${topPosition}rem`, height: `calc(${height}rem - 2px)`, transition: 'top 0.3s ease-out'}}>
                                 
                                {isCompact ? (
                                    <div className="flex items-center justify-between h-full text-xs">
                                        <div className="flex items-center gap-1.5 min-w-0">
                                            <Avatar className="h-5 w-5">
                                                {userAvatar && <AvatarImage src={userAvatar.imageUrl} data-ai-hint={userAvatar.imageHint}/>}
                                                <AvatarFallback className="text-xs">{app.patientDetails?.fullName?.charAt(0) || '?'}</AvatarFallback>
                                            </Avatar>
                                            <span className="font-medium truncate">{app.patientDetails?.fullName}</span>
                                        </div>
                                        <Badge variant="secondary" className="opacity-80 whitespace-nowrap">{app.status}</Badge>
                                    </div>
                                ) : (
                                    <div className="flex flex-col justify-between h-full">
                                        <div className="flex items-start gap-2">
                                            <Avatar className="h-6 w-6">
                                                {userAvatar && <AvatarImage src={userAvatar.imageUrl} data-ai-hint={userAvatar.imageHint}/>}
                                                <AvatarFallback>{app.patientDetails?.fullName?.charAt(0) || '?'}</AvatarFallback>
                                            </Avatar>
                                            <div className="min-w-0">
                                                <p className="font-medium truncate text-sm">{app.patientDetails?.fullName || 'Unknown Patient'}</p>
                                                <p className="text-xs font-code">MRN: {app.patientDetails?.mrn || 'N/A'}</p>
                                            </div>
                                        </div>
                                        <Badge variant="secondary" className="opacity-80 whitespace-nowrap self-end">
                                            {app.status}
                                        </Badge>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* New Appointment Dialog */}
      <Dialog open={isNewAppointmentDialogOpen} onOpenChange={setNewAppointmentDialogOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Book New Appointment</DialogTitle>
                <DialogDescription>
                    Book a new appointment for {newAppointmentTime} on {format(currentDate, 'MMMM d, yyyy')}.
                </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
                 {selectedPatientForNewAppt ? (
                    <div className="flex items-center gap-2 rounded-md border p-2 bg-muted/50">
                        <div className="flex-grow">
                            <p className="font-medium">{selectedPatientForNewAppt.fullName}</p>
                            <p className="text-sm text-muted-foreground">MRN: {selectedPatientForNewAppt.mrn}</p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => setSelectedPatientForNewAppt(null)}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                    </div>
                ) : (
                    <div>
                        <Label>Find Patient</Label>
                        <PatientSearch onSelectPatient={setSelectedPatientForNewAppt} />
                    </div>
                )}
                <div>
                  <Label>Duration</Label>
                   <Select
                        value={String(newAppointmentDuration)}
                        onValueChange={(value) => setNewAppointmentDuration(Number(value))}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Set duration" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="15">15 minutes</SelectItem>
                            <SelectItem value="30">30 minutes</SelectItem>
                            <SelectItem value="45">45 minutes</SelectItem>
                            <SelectItem value="60">60 minutes</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setNewAppointmentDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleCreateAppointment} disabled={!selectedPatientForNewAppt}>Book Appointment</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Appointment Dialog */}
      <Dialog open={isEditAppointmentDialogOpen} onOpenChange={setEditAppointmentDialogOpen}>
          <DialogContent>
            {editingAppointment && (
                <>
                <DialogHeader>
                    <DialogTitle>Edit Appointment</DialogTitle>
                    <DialogDescription>
                        Update status for {editingAppointment.patientDetails?.fullName} at {format(editingAppointment.scheduledTime, 'HH:mm')}.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    <div>
                        <Label>Status</Label>
                        <Select
                            value={editingAppointment.status}
                            onValueChange={(value) => setEditingAppointment(prev => prev ? {...prev, status: value as Appointment['status']} : null)}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {APPOINTMENT_STATUSES.map(status => (
                                    <SelectItem key={status} value={status}>{status}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter className="justify-between">
                     <Button variant="destructive" onClick={handleDeleteAppointment}>
                        <Trash2 className="mr-2 h-4 w-4"/>
                        Cancel Appointment
                    </Button>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setEditAppointmentDialogOpen(false)}>Close</Button>
                        <Button onClick={handleUpdateAppointment}>Save Changes</Button>
                    </div>
                </DialogFooter>
                </>
            )}
          </DialogContent>
      </Dialog>

    </div>
  );
}
