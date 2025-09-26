
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
import { CheckCircle, Loader2, PlusCircle, Search, X } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import type { Patient } from '@/lib/schemas/patient';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PatientFormSchema, type PatientFormData } from '@/lib/schemas/patient';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, useFormField } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

export const PatientSearch = ({ onSelectPatient, placeholder }: { onSelectPatient: (patient: Patient) => void, placeholder?: string }) => {
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

    const handleSelect = (patient: Patient) => {
        onSelectPatient(patient);
        setPatientSearchTerm('');
        setPatientSearchResults([]);
    }

    return (
        <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
                placeholder={placeholder || "Search by Patient Name or MRN..."}
                className="pl-8"
                value={patientSearchTerm}
                onChange={(e) => setPatientSearchTerm(e.target.value)}
            />
            {(isSearchingPatients || patientSearchResults.length > 0) && (
                 <div className="absolute z-50 w-full mt-1 bg-card border rounded-md shadow-lg">
                    {isSearchingPatients && <div className="p-2 text-sm text-muted-foreground">Searching...</div>}
                    {patientSearchResults.map(p => (
                        <li key={p._id} onClick={() => handleSelect(p)} className="p-2 hover:bg-accent cursor-pointer list-none">
                            <p className="font-medium">{p.fullName}</p>
                            <p className="text-sm text-muted-foreground">MRN: {p.mrn}</p>
                        </li>
                    ))}
                </div>
            )}
        </div>
    );
};


const PatientForm = ({ onSave, closeDialog, patientData }: { onSave: (data: PatientFormData) => void, closeDialog: () => void, patientData?: Partial<PatientFormData> }) => {
    const { token } = useAuth();
    const { toast } = useToast();

    const [isSelfPay, setIsSelfPay] = useState(patientData?.insuranceInfo?.length === 0);

    const form = useForm<PatientFormData>({
        resolver: zodResolver(PatientFormSchema),
        defaultValues: patientData || {
            mrn: '',
            fullName: '',
            dateOfBirth: { day: undefined, month: undefined, year: undefined },
            gender: 'Male',
            contactInfo: {
                phone: '',
                email: '',
                address: { street: '', city: '', state: '', zipCode: '', country: 'USA' }
            },
            insuranceInfo: [{ providerName: '', policyNumber: '', groupNumber: '', isPrimary: true }]
        }
    });

    const [isVerifying, setIsVerifying] = useState(false);
    const [verificationStatus, setVerificationStatus] = useState<'idle' | 'verifying' | 'verified' | 'failed'>('idle');
    
    // Effect to toggle insurance info
    useEffect(() => {
        if(isSelfPay) {
            form.setValue('insuranceInfo', []);
        } else {
            form.setValue('insuranceInfo', patientData?.insuranceInfo || [{ providerName: '', policyNumber: '', groupNumber: '', isPrimary: true }]);
        }
    }, [isSelfPay, form, patientData]);


    const watchedYear = form.watch("dateOfBirth.year");
    const watchedMonth = form.watch("dateOfBirth.month");

    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;
    const currentDay = today.getDate();

    const DateOfBirthErrorMessage = () => {
        const { error } = useFormField();
        const errorMessage = error ? String(error?.message) : null;

        if (!errorMessage) return null;

        const isRootError = !form.formState.errors.dateOfBirth?.day && !form.formState.errors.dateOfBirth?.month && !form.formState.errors.dateOfBirth?.year;

        if (isRootError) {
          return <FormMessage>{errorMessage}</FormMessage>;
        }
        return null;
    }


    const handleSimulateScan = () => {
        form.reset({
            mrn: `MRN${Math.floor(1000 + Math.random() * 9000)}`,
            fullName: 'John Doe',
            dateOfBirth: { day: 15, month: 5, year: 1990 },
            gender: 'Male',
            contactInfo: {
                phone: '555-0199',
                email: 'john.doe@example.com',
                address: { street: '123 Main St', city: 'Anytown', state: 'NY', zipCode: '12345', country: 'USA' }
            },
            insuranceInfo: [{ providerName: 'Bupa', policyNumber: 'BUPA-98765', groupNumber: 'GRP-XYZ', isPrimary: true }]
        });
        setIsSelfPay(false);
    };

    const handleVerifyEligibility = async () => {
        const patientId = form.getValues('_id');
        if (!patientId) {
            toast({
                variant: "destructive",
                title: "Cannot Verify Eligibility",
                description: "Please save the patient record before verifying insurance.",
            });
            return;
        }

        setIsVerifying(true);
        setVerificationStatus('verifying');
        
        try {
            const response = await fetch(`/api/v1/patients/${patientId}/verify-eligibility`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.status === 202) {
                toast({
                    title: "Verification Initiated",
                    description: "The eligibility check is running in the background. The status will update shortly.",
                });
                // In a real app with WebSockets, you'd listen for an event.
                // Here, we'll just simulate the success state after a delay.
                setTimeout(() => {
                    setVerificationStatus('verified');
                    setIsVerifying(false);
                }, 3000); // Simulate a 3-second background job
            } else {
                 const errorData = await response.json();
                 toast({
                    variant: "destructive",
                    title: "Verification Failed",
                    description: errorData.message || "Could not start eligibility check."
                 });
                 setVerificationStatus('failed');
                 setIsVerifying(false);
            }

        } catch (error) {
            toast({
                variant: "destructive",
                title: "Network Error",
                description: "Could not connect to the server for verification.",
            });
            setVerificationStatus('failed');
            setIsVerifying(false);
        }
    }

    const isVerifyButtonDisabled = isVerifying || !form.getValues('_id');

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSave)}>
                <DialogHeader>
                    <DialogTitle>{patientData?._id ? "Edit Patient" : "Register New Patient"}</DialogTitle>
                    <DialogDescription>
                        Fill in the details for the patient record.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-6 py-4 max-h-[70vh] overflow-y-auto px-6">
                    <Button type="button" variant="outline" onClick={handleSimulateScan}>Simulate ID/Insurance Card Scan</Button>
                    
                    <Separator />
                    <h4 className="font-medium text-sm">Patient Demographics</h4>

                    <FormField control={form.control} name="mrn" render={({ field }) => (
                        <FormItem><FormLabel>Medical Record Number (MRN)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="fullName" render={({ field }) => (
                        <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
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
                                                        <Input type="number" min="1" max={watchedYear === currentYear && watchedMonth === currentMonth ? currentDay : 31} placeholder="DD" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value === '' ? undefined : parseInt(e.target.value, 10))} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="dateOfBirth.month"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <Input type="number" min="1" max={watchedYear === currentYear ? currentMonth : 12} placeholder="MM" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value === '' ? undefined : parseInt(e.target.value, 10))} />
                                                    </FormControl>
                                                     <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="dateOfBirth.year"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <Input type="number" min="1900" max={new Date().getFullYear()} placeholder="YYYY" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value === '' ? undefined : parseInt(e.target.value, 10))} />
                                                    </FormControl>
                                                     <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <DateOfBirthErrorMessage />
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

                    <Separator />
                    <h4 className="font-medium text-sm">Contact Information</h4>

                    <FormField control={form.control} name="contactInfo.phone" render={({ field }) => (
                        <FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="contactInfo.email" render={({ field }) => (
                        <FormItem><FormLabel>Email Address (Optional)</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="contactInfo.address.street" render={({ field }) => (
                        <FormItem><FormLabel>Street Address</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <div className="grid grid-cols-2 gap-4">
                        <FormField control={form.control} name="contactInfo.address.city" render={({ field }) => (
                            <FormItem><FormLabel>City</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="contactInfo.address.state" render={({ field }) => (
                            <FormItem><FormLabel>State/Province</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <FormField control={form.control} name="contactInfo.address.zipCode" render={({ field }) => (
                            <FormItem><FormLabel>Zip Code</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="contactInfo.address.country" render={({ field }) => (
                            <FormItem><FormLabel>Country</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                    </div>

                    <Separator />
                     <div className="space-y-4">
                         <h4 className="font-medium text-sm">Insurance Information</h4>
                        <div className="flex items-center space-x-2">
                           <Checkbox id="isSelfPay" checked={isSelfPay} onCheckedChange={(checked) => setIsSelfPay(!!checked)} />
                           <label htmlFor="isSelfPay" className="text-sm font-medium leading-none">
                            Patient is self-pay (no insurance)
                           </label>
                        </div>
                    
                        {!isSelfPay && (
                            <div className="space-y-4 pl-2 border-l-2 ml-2">
                                <div className="flex justify-between items-center">
                                    <h5 className="font-medium text-sm">Primary Insurance</h5>
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                {/* The button is wrapped in a span for the tooltip to work when disabled */}
                                                <span tabIndex={isVerifyButtonDisabled ? 0 : -1}>
                                                    <Button type="button" variant="secondary" size="sm" onClick={handleVerifyEligibility} disabled={isVerifyButtonDisabled}>
                                                        {isVerifying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                        Verify Eligibility
                                                    </Button>
                                                </span>
                                            </TooltipTrigger>
                                            {isVerifyButtonDisabled && !isVerifying && (
                                                <TooltipContent>
                                                    <p>Please save the patient record first to enable eligibility checks.</p>
                                                </TooltipContent>
                                            )}
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                                {verificationStatus === 'verified' && (
                                    <div className="flex items-center gap-2 text-sm text-green-600 p-2 bg-green-500/10 rounded-md">
                                        <CheckCircle className="h-4 w-4" />
                                        <span>Eligibility Verified: Active Coverage. Co-pay: $25.00</span>
                                    </div>
                                )}
                                {verificationStatus === 'verifying' && (
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground p-2">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        <span>Verifying eligibility with provider...</span>
                                    </div>
                                )}
                                <FormField control={form.control} name="insuranceInfo.0.providerName" render={({ field }) => (
                                    <FormItem><FormLabel>Provider Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField control={form.control} name="insuranceInfo.0.policyNumber" render={({ field }) => (
                                    <FormItem><FormLabel>Policy Number</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField control={form.control} name="insuranceInfo.0.groupNumber" render={({ field }) => (
                                    <FormItem><FormLabel>Group Number (Optional)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                            </div>
                        )}
                    </div>
                </div>
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={closeDialog}>Cancel</Button>
                    <Button type="submit" disabled={form.formState.isSubmitting}>
                        {form.formState.isSubmitting ? 'Saving...' : 'Save Patient'}
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
            <DialogContent className="sm:max-w-3xl">
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
                    <TableCell>{patient.fullName}</TableCell>
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
