
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
import { PlusCircle, Search } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import type { Patient, PatientFormData } from '@/lib/schemas/patient';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PatientFormSchema } from '@/lib/schemas/patient';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const PatientForm = ({ onSave, closeDialog }: { onSave: (data: PatientFormData) => void, closeDialog: () => void }) => {
    const form = useForm<PatientFormData>({
        resolver: zodResolver(PatientFormSchema),
        defaultValues: {
            mrn: '',
            firstName: '',
            lastName: '',
            dateOfBirth: { day: undefined, month: undefined, year: undefined },
            gender: 'Male',
            contactInfo: {
                phone: '',
                email: '',
                address: { street: '', city: '', state: '', zipCode: '', country: 'Saudi Arabia' }
            },
            insuranceInfo: [{ providerName: '', policyNumber: '', groupNumber: '', isPrimary: true }]
        }
    });

    const handleSimulateScan = () => {
        form.reset({
            mrn: `MRN${Math.floor(1000 + Math.random() * 9000)}`,
            firstName: 'John',
            lastName: 'Doe',
            dateOfBirth: { day: 15, month: 5, year: 1990 },
            gender: 'Male',
            contactInfo: {
                phone: '+966501234567',
                email: 'john.doe@example.com',
                address: { street: '123 Main St', city: 'Riyadh', state: 'Riyadh', zipCode: '11564', country: 'Saudi Arabia' }
            },
            insuranceInfo: [{ providerName: 'Bupa', policyNumber: 'BUPA-98765', groupNumber: 'GRP-XYZ', isPrimary: true }]
        });
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSave)}>
                <DialogHeader>
                    <DialogTitle>Register New Patient</DialogTitle>
                    <DialogDescription>
                        Fill in the details to add a new patient to the system.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-6">
                    <Button type="button" variant="outline" onClick={handleSimulateScan}>Simulate ID/Insurance Card Scan</Button>
                    <FormField control={form.control} name="mrn" render={({ field }) => (
                        <FormItem><FormLabel>Medical Record Number (MRN)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                     <div className="grid grid-cols-2 gap-4">
                        <FormField control={form.control} name="firstName" render={({ field }) => (
                            <FormItem><FormLabel>First Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="lastName" render={({ field }) => (
                            <FormItem><FormLabel>Last Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                       <FormField
                            control={form.control}
                            name="dateOfBirth"
                            render={() => (
                                <FormItem>
                                    <FormLabel>Date of Birth</FormLabel>
                                    <div className="grid grid-cols-3 gap-2">
                                        <FormField
                                            control={form.control}
                                            name="dateOfBirth.day"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <Input type="number" placeholder="DD" value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value, 10) || undefined)} />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="dateOfBirth.month"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <Input type="number" placeholder="MM" value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value, 10) || undefined)} />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="dateOfBirth.year"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <Input type="number" placeholder="YYYY" value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value, 10) || undefined)} />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField control={form.control} name="gender" render={({ field }) => (
                            <FormItem><FormLabel>Gender</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                <SelectContent><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem><SelectItem value="Other">Other</SelectItem><SelectItem value="Prefer not to say">Prefer not to say</SelectItem></SelectContent>
                            </Select><FormMessage /></FormItem>
                        )} />
                    </div>
                    <FormField control={form.control} name="contactInfo.phone" render={({ field }) => (
                        <FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="contactInfo.email" render={({ field }) => (
                        <FormItem><FormLabel>Email Address (Optional)</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                </div>
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={closeDialog}>Cancel</Button>
                    <Button type="submit" disabled={form.formState.isSubmitting}>
                        {form.formState.isSubmitting ? 'Registering...' : 'Register Patient'}
                    </Button>
                </DialogFooter>
            </form>
        </Form>
    );
}


export default function PatientsPage() {
    const { user, token } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [patients, setPatients] = useState<Patient[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setDialogOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchPatients = async (search = '') => {
        if (!token) return;
        setIsLoading(true);
        try {
            const response = await fetch(`/api/v1/patients?search=${search}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.ok) {
                const result = await response.json();
                setPatients(result.data);
            } else {
                toast({ variant: 'destructive', title: 'Failed to fetch patients.' });
            }
        } catch (error) {
            toast({ variant: 'destructive', title: 'An error occurred while fetching patients.' });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (user && !['receptionist', 'manager'].includes(user.role)) {
            router.push('/dashboard');
        }
        if (token) {
            fetchPatients();
        }
    }, [user, token, router]);

    useEffect(() => {
        const handler = setTimeout(() => {
            if (token) {
              fetchPatients(searchTerm);
            }
        }, 500); // Debounce search
        return () => clearTimeout(handler);
    }, [searchTerm, token]);

    const handleRegisterPatient = async (data: PatientFormData) => {
        try {
            const response = await fetch('/api/v1/patients', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                toast({ title: 'Patient registered successfully!' });
                setDialogOpen(false);
                fetchPatients(); // Refresh the list
            } else {
                 const errorData = await response.json();
                 if (response.status === 409) {
                     toast({ variant: 'destructive', title: 'Registration Failed', description: errorData.message });
                 } else {
                    toast({ variant: 'destructive', title: 'Registration Failed', description: errorData.message || 'Please check the form and try again.' });
                 }
            }
        } catch (error) {
            toast({ variant: 'destructive', title: 'An error occurred.' });
        }
    };
    
    const formatDateOfBirth = (dob: any): string => {
        if (!dob) return 'N/A';
        // Handle both Date objects from creation and object from DB
        if (dob instanceof Date) {
            return format(dob, 'yyyy-MM-dd');
        }
        if(typeof dob === 'string') {
             return format(new Date(dob), 'yyyy-MM-dd');
        }
        if (dob.year && dob.month && dob.day) {
            return format(new Date(dob.year, dob.month - 1, dob.day), 'yyyy-MM-dd');
        }
        return 'Invalid Date';
    };

    if (!user || !['receptionist', 'manager'].includes(user.role)) {
        return <div className="flex min-h-screen items-center justify-center"><Skeleton className="h-32 w-full" /></div>;
    }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="font-headline text-3xl font-semibold">Patient Registration</h1>
         <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Register New Patient
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
                <PatientForm onSave={handleRegisterPatient} closeDialog={() => setDialogOpen(false)} />
            </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Patient Records</CardTitle>
          <CardDescription>
            Search for an existing patient before creating a new record to avoid duplicates.
          </CardDescription>
          <div className="relative pt-4">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search patients by name or MRN..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>MRN</TableHead>
                <TableHead>Full Name</TableHead>
                <TableHead>Date of Birth</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead>Phone Number</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                        <TableCell colSpan={5}><Skeleton className="h-6 w-full" /></TableCell>
                    </TableRow>
                  ))
              ) : patients.length > 0 ? (
                patients.map((patient) => (
                    <TableRow key={patient._id}>
                    <TableCell className="font-medium font-code">
                        <Link href={`/patients/${patient._id}`} className="text-primary hover:underline">
                            {patient.mrn}
                        </Link>
                    </TableCell>
                    <TableCell>{patient.firstName} {patient.lastName}</TableCell>
                    <TableCell>{formatDateOfBirth(patient.dateOfBirth)}</TableCell>
                    <TableCell>{patient.gender}</TableCell>
                    <TableCell>{patient.contactInfo.phone}</TableCell>
                    </TableRow>
                ))
              ) : (
                <TableRow>
                    <TableCell colSpan={5} className="text-center h-24">
                        {searchTerm ? `No patients found for "${searchTerm}"` : 'No patients found. Register a new patient to get started.'}
                    </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

    