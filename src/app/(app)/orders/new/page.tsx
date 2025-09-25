
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
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Search, X } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import type { Patient } from '@/lib/schemas/patient';
import type { TestCatalog } from '@/lib/schemas/test-catalog';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

export default function NewOrderPage() {
    const { user, token } = useAuth();
    const router = useRouter();
    const { toast } = useToast();

    // Patient Search State
    const [patientSearchTerm, setPatientSearchTerm] = useState('');
    const [patientSearchResults, setPatientSearchResults] = useState<Patient[]>([]);
    const [isSearchingPatients, setIsSearchingPatients] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

    // Test Search State
    const [testSearchTerm, setTestSearchTerm] = useState('');
    const [testSearchResults, setTestSearchResults] = useState<TestCatalog[]>([]);
    const [isSearchingTests, setIsSearchingTests] = useState(false);
    const [selectedTests, setSelectedTests] = useState<TestCatalog[]>([]);

    const [icd10Code, setIcd10Code] = useState('');
    const [physician, setPhysician] = useState('');
    const [notes, setNotes] = useState('');
    const [isCreating, setIsCreating] = useState(false);

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
            // In a real app, this would be a debounced API call.
            // For now, we simulate with a filter on a pre-fetched list if available,
            // or we would fetch here. This part will be completed when the Test Catalog API is final.
            // setTestSearchResults(allTests.filter(t => t.name.toLowerCase().includes(testSearchTerm.toLowerCase())));
            setIsSearchingTests(false);
        }, 500);

         return () => clearTimeout(handler);
    }, [testSearchTerm, token]);


    const handleSelectPatient = (patient: Patient) => {
        setSelectedPatient(patient);
        setPatientSearchTerm('');
        setPatientSearchResults([]);
    };

    const handleAddTest = (test: TestCatalog) => {
      if (!selectedTests.find(t => t._id === test._id)) {
        setSelectedTests([...selectedTests, test]);
      }
      setTestSearchTerm('');
      setTestSearchResults([]);
    }

    const handleRemoveTest = (testId: string) => {
      setSelectedTests(selectedTests.filter(t => t._id !== testId));
    }
    
    const orderTotal = selectedTests.reduce((total, test) => total + test.price, 0);

    const handleCreateOrder = async () => {
        // This function will be built out in the next step to call the backend API
        toast({ title: "Order creation pending backend implementation." });
    };

  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-headline text-3xl font-semibold">Create New Order</h1>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
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
              <div className="space-y-2">
                <Label>Find Patient</Label>
                {selectedPatient ? (
                     <div className="flex items-center gap-2 rounded-md border p-2 bg-muted/50">
                        <div className="flex-grow">
                            <p className="font-medium">{selectedPatient.fullName}</p>
                            <p className="text-sm text-muted-foreground">MRN: {selectedPatient.mrn}</p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => setSelectedPatient(null)}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                ) : (
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
                )}
                 <div className="text-sm text-muted-foreground pt-2">
                    Or <Button variant="link" className="p-0 h-auto" onClick={() => router.push('/patients')}>register a new patient</Button>.
                </div>
              </div>

              {/* Referring Physician */}
              <div className="space-y-2">
                <Label htmlFor="physician">Referring Doctor (Optional)</Label>
                <Input id="physician" placeholder="e.g., Dr. Smith @ Main Clinic" value={physician} onChange={e => setPhysician(e.target.value)} />
              </div>

              {/* ICD-10 Code */}
              <div className="space-y-2">
                <Label htmlFor="icd10">ICD-10 Diagnosis Code</Label>
                <Input id="icd10" placeholder="e.g., E11.9" value={icd10Code} onChange={e => setIcd10Code(e.target.value)} />
              </div>
              
              <Separator />

              {/* Test Selection */}
              <div className="space-y-4">
                 <Label>Select Tests</Label>
                 <div className="space-y-2">
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
              </div>

              <Separator />

                <div className="space-y-2">
                    <Label htmlFor="notes">Clinical Notes (Optional)</Label>
                    <Textarea id="notes" placeholder="Enter any relevant clinical information..." value={notes} onChange={e => setNotes(e.target.value)} />
                </div>


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
                        <span>{selectedPatient?.fullName || 'Not selected'}</span>
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
                      size="lg" 
                      onClick={handleCreateOrder}
                      disabled={!selectedPatient || selectedTests.length === 0 || !icd10Code || isCreating}
                    >
                      {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Create Order
                    </Button>
                    <Button variant="outline" disabled={isCreating}>Save as Draft</Button>
                </CardFooter>
            </Card>
        </div>
      </div>
    </div>
  );
}
