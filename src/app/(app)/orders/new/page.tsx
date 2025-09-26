
'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Search, X } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import type { Patient } from '@/lib/schemas/patient';
import type { TestCatalog } from '@/lib/schemas/test-catalog';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateOrderInput, CreateOrderInputSchema } from '@/lib/schemas/order';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

type FormValues = CreateOrderInput & {
    physicianSearch?: string;
};

export default function NewOrderPage() {
    const { user, token } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();

    // UI State
    const [patientSearchTerm, setPatientSearchTerm] = useState('');
    const [patientSearchResults, setPatientSearchResults] = useState<Patient[]>([]);
    const [isSearchingPatients, setIsSearchingPatients] = useState(false);
    
    const [testSearchTerm, setTestSearchTerm] = useState('');
    const [testSearchResults, setTestSearchResults] = useState<TestCatalog[]>([]);
    const [isSearchingTests, setIsSearchingTests] = useState(false);

    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
    const [selectedTests, setSelectedTests] = useState<TestCatalog[]>([]);
    
    const form = useForm<FormValues>({
        resolver: zodResolver(CreateOrderInputSchema),
        defaultValues: {
            patientId: '',
            icd10Code: '',
            testCodes: [],
            priority: 'Routine',
            billingType: 'Insurance',
            notes: '',
        }
    });

    // Handle pre-selecting a patient from query params
    useEffect(() => {
        const patientId = searchParams.get('patientId');
        if (patientId && token && !selectedPatient) {
            const fetchPatient = async () => {
                try {
                    const response = await fetch(`/api/v1/patients/${patientId}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (response.ok) {
                        const result = await response.json();
                        handleSelectPatient(result.data);
                    } else {
                        toast({ variant: 'destructive', title: 'Could not pre-load patient.'});
                    }
                } catch (error) {
                    console.error("Failed to fetch patient by ID", error);
                }
            };
            fetchPatient();
        }
    }, [searchParams, token, selectedPatient]);


    // Debounced search for patients
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

    // Debounced search for tests
    useEffect(() => {
        if (testSearchTerm.length < 2) {
            setTestSearchResults([]);
            return;
        }

        const handler = setTimeout(async () => {
            if (!token) return;
            setIsSearchingTests(true);
            try {
                const response = await fetch(`/api/v1/test-catalog?search=${testSearchTerm}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                 if (response.ok) {
                    const result = await response.json();
                    setTestSearchResults(result.data.filter((test: TestCatalog) => 
                        !selectedTests.some(selected => selected._id === test._id)
                    ));
                }
            } catch (error) {
                console.error("Failed to search tests", error);
            } finally {
                setIsSearchingTests(false);
            }
        }, 300);

         return () => clearTimeout(handler);
    }, [testSearchTerm, token, selectedTests]);


    const handleSelectPatient = (patient: Patient) => {
        setSelectedPatient(patient);
        form.setValue('patientId', patient._id);
        // Default billing type based on patient's insurance info
        const hasInsurance = patient.insuranceInfo && patient.insuranceInfo.length > 0;
        form.setValue('billingType', hasInsurance ? 'Insurance' : 'Self-Pay');
        setPatientSearchTerm('');
        setPatientSearchResults([]);
    };

    const handleDeselectPatient = () => {
        setSelectedPatient(null);
        form.setValue('patientId', '');
    };

    const handleAddTest = (test: TestCatalog) => {
      if (!selectedTests.find(t => t._id === test._id)) {
        const newSelectedTests = [...selectedTests, test];
        setSelectedTests(newSelectedTests);
        form.setValue('testCodes', newSelectedTests.map(t => t.testCode));
      }
      setTestSearchTerm('');
      setTestSearchResults([]);
    }

    const handleRemoveTest = (testId: string) => {
        const newSelectedTests = selectedTests.filter(t => t._id !== testId);
        setSelectedTests(newSelectedTests);
        form.setValue('testCodes', newSelectedTests.map(t => t.testCode));
    }
    
    const orderTotal = selectedTests.reduce((total, test) => total + test.price, 0);

    const handleCreateOrder = async (values: FormValues) => {
        if (!token) return;

        try {
            const response = await fetch('/api/v1/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(values),
            });

            if (response.ok) {
                const newOrder = await response.json();
                toast({
                    title: "Order Created Successfully!",
                    description: `Order ID: ${newOrder.data.orderId}`,
                });
                router.push(`/orders/${newOrder.data.orderId}`);
            } else {
                const errorData = await response.json();
                 toast({
                    variant: 'destructive',
                    title: 'Failed to Create Order',
                    description: errorData.message || 'An unexpected error occurred.',
                });
            }
        } catch (error) {
             toast({
                variant: 'destructive',
                title: 'Network Error',
                description: 'Could not connect to the server.',
            });
        }
    };

  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-headline text-3xl font-semibold">Create New Order</h1>
       <Form {...form}>
        <form onSubmit={form.handleSubmit(handleCreateOrder)} className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
            <Card>
                <CardHeader>
                <CardTitle>Order Details</CardTitle>
                <CardDescription>
                    Select a patient and the tests to be ordered.
                </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                
                {/* Patient Selection */}
                <FormField
                    control={form.control}
                    name="patientId"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Find Patient</FormLabel>
                         {selectedPatient ? (
                            <div className="flex items-center gap-2 rounded-md border p-2 bg-muted/50">
                                <div className="flex-grow">
                                    <p className="font-medium">{selectedPatient.fullName}</p>
                                    <p className="text-sm text-muted-foreground">MRN: {selectedPatient.mrn}</p>
                                </div>
                                <Button variant="ghost" size="icon" onClick={handleDeselectPatient}>
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        ) : (
                            <FormControl>
                                <div className="relative">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search by Patient Name or MRN..."
                                        className="pl-8"
                                        value={patientSearchTerm}
                                        onChange={(e) => setPatientSearchTerm(e.target.value)}
                                    />
                                    {(isSearchingPatients || patientSearchResults.length > 0) && (
                                        <div className="absolute z-20 w-full mt-1 bg-card border rounded-md shadow-lg">
                                            {isSearchingPatients && <div className="p-2 text-sm text-muted-foreground">Searching...</div>}
                                            {patientSearchResults.length > 0 && (
                                                <ul>
                                                    {patientSearchResults.map(p => (
                                                        <li key={p._id} onClick={() => handleSelectPatient(p)} className="p-2 hover:bg-accent cursor-pointer">
                                                            <p className="font-medium">{p.fullName}</p>
                                                            <p className="text-sm text-muted-foreground">MRN: {p.mrn}</p>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </FormControl>
                        )}
                        <FormMessage />
                        <div className="text-sm text-muted-foreground pt-2">
                            Or <Button variant="link" className="p-0 h-auto" onClick={() => router.push('/patients/new')}>register a new patient</Button>.
                        </div>
                    </FormItem>
                    )}
                />

                 {/* Billing Type */}
                <FormField
                    control={form.control}
                    name="billingType"
                    render={({ field }) => (
                        <FormItem className="space-y-3">
                        <FormLabel>Billing Type for this Order</FormLabel>
                        <FormControl>
                            <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex items-center space-x-4"
                            >
                            <FormItem className="flex items-center space-x-2 space-y-0">
                                <FormControl>
                                <RadioGroupItem value="Insurance" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                Bill Insurance
                                </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-2 space-y-0">
                                <FormControl>
                                <RadioGroupItem value="Self-Pay" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                Self-Pay
                                </FormLabel>
                            </FormItem>
                            </RadioGroup>
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />


                {/* Referring Physician */}
                <FormField
                    control={form.control}
                    name="physicianId"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Referring Doctor (Optional)</FormLabel>
                         <FormControl>
                            <Input placeholder="Search for doctor..." {...field} />
                         </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />

                {/* ICD-10 Code */}
                 <FormField
                    control={form.control}
                    name="icd10Code"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>ICD-10 Diagnosis Code</FormLabel>
                         <FormControl>
                            <Input placeholder="e.g., E11.9" {...field} />
                         </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                
                <Separator />

                {/* Test Selection */}
                <FormField
                    control={form.control}
                    name="testCodes"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Select Tests</FormLabel>
                        <div className="space-y-2">
                             <FormControl>
                                <div className="relative">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search for tests by name or code..."
                                        className="pl-8"
                                        value={testSearchTerm}
                                        onChange={(e) => setTestSearchTerm(e.target.value)}
                                        disabled={!selectedPatient}
                                    />
                                    {(isSearchingTests || testSearchResults.length > 0) && (
                                        <div className="absolute z-10 w-full mt-1 bg-card border rounded-md shadow-lg">
                                            {isSearchingTests && <div className="p-2 text-sm text-muted-foreground">Searching...</div>}
                                            {testSearchResults.map(t => (
                                                <div key={t._id} onClick={() => handleAddTest(t)} className="p-2 hover:bg-accent cursor-pointer flex justify-between">
                                                    <span>{t.name} ({t.testCode})</span>
                                                    <span className="text-muted-foreground">${t.price.toFixed(2)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                             </FormControl>
                            {selectedTests.length > 0 && (
                            <div className="space-y-2 pt-2">
                                {selectedTests.map(test => (
                                <div key={test._id} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                                    <div>
                                    <p className="font-medium">{test.name}</p>
                                    <p className="text-xs text-muted-foreground">{test.testCode}</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                    <span>${test.price.toFixed(2)}</span>
                                    <Button variant="ghost" size="icon" onClick={() => handleRemoveTest(test._id)}>
                                        <X className="h-4 w-4 text-destructive" />
                                    </Button>
                                    </div>
                                </div>
                                ))}
                            </div>
                            )}
                        </div>
                         <FormMessage />
                    </FormItem>
                    )}
                />

                <Separator />

                <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Clinical Notes (Optional)</FormLabel>
                         <FormControl>
                            <Textarea placeholder="Enter any relevant clinical information..." {...field} />
                         </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                </CardContent>
            </Card>
            </div>
            <div className="lg:col-span-1">
                <Card className="sticky top-24">
                    <CardHeader>
                        <CardTitle>Order Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Patient</span>
                            <span className="truncate max-w-40">{selectedPatient?.fullName || 'Not selected'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Tests</span>
                            <span>{selectedTests.length}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-semibold text-lg">
                            <span>Total</span>
                            <span>${orderTotal.toFixed(2)}</span>
                        </div>
                    </CardContent>
                    <CardFooter className="flex-col gap-4 items-stretch">
                        <Button 
                        type="submit"
                        size="lg" 
                        disabled={form.formState.isSubmitting}
                        >
                        {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Create Order
                        </Button>
                        <Button variant="outline" type="button" disabled={form.formState.isSubmitting}>Save as Draft</Button>
                    </CardFooter>
                </Card>
            </div>
        </form>
       </Form>
    </div>
  );
}
