
'use client';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAuth } from '@/hooks/use-auth';
import { Edit, PlusCircle, Search, Trash2, X } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import type { TestCatalog } from '@/lib/schemas/test-catalog';
import { useToast } from '@/hooks/use-toast';
import { Icons } from '@/components/icons';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

const emptyTest: Omit<TestCatalog, '_id'> = {
    testCode: '',
    name: '',
    description: '',
    specimenRequirements: {
      tubeType: 'Lavender Top',
      minVolume: 0,
      units: 'mL',
    },
    turnaroundTime: {
      routine: { value: 24, units: 'hours' },
      stat: { value: 1, units: 'hours' },
    },
    price: 0,
    isPanel: false,
    isActive: true,
    referenceRanges: [],
    reflexRules: [],
}

export default function TestCatalogPage() {
  const { user, token } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [tests, setTests] = useState<TestCatalog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [editingTest, setEditingTest] = useState<Partial<TestCatalog> | null>(null);

  const fetchTests = async () => {
    if (!token) return;
    try {
      setIsLoading(true);
      const response = await fetch('/api/v1/test-catalog', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const result = await response.json();
        setTests(result.data);
      } else {
        const errorText = await response.text();
        console.error("Failed to fetch tests. API response:", errorText);
        toast({
          variant: 'destructive',
          title: 'Failed to fetch tests',
          description: `Server responded with status ${response.status}`,
        });
      }
    } catch (error) {
       console.error("An error occurred while fetching tests:", error);
       toast({
        variant: 'destructive',
        title: 'An error occurred while fetching tests.',
        description: 'Check the browser console for more details.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role !== 'manager') {
      router.push('/dashboard');
    }
    if (user && user.role === 'manager' && token) {
      fetchTests();
    }
  }, [user, token]);

  if (user?.role !== 'manager' && !isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  const handleSaveTest = async (testToSave: Partial<TestCatalog>) => {
    const isNew = !testToSave._id;
    const url = isNew ? '/api/v1/test-catalog' : `/api/v1/test-catalog/${testToSave._id}`;
    const method = isNew ? 'POST' : 'PUT';

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(testToSave),
      });

      if (response.ok) {
        toast({ title: `Test ${isNew ? 'created' : 'updated'} successfully!` });
        fetchTests();
        setDialogOpen(false);
        setEditingTest(null);
      } else {
        const errorData = await response.json();
        toast({
          variant: 'destructive',
          title: `Failed to ${isNew ? 'create' : 'update'} test`,
          description: errorData.message || 'Please check your input and try again.',
        });
      }
    } catch (error) {
        toast({ variant: 'destructive', title: 'An error occurred.' });
    }
  };

  const handleDeleteTest = async (testId: string) => {
    try {
      const response = await fetch(`/api/v1/test-catalog/${testId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        toast({ title: 'Test deleted successfully.' });
        fetchTests();
      } else {
        toast({ variant: 'destructive', title: 'Failed to delete test.' });
      }
    } catch (error) {
       toast({ variant: 'destructive', title: 'An error occurred.' });
    }
  }
  
  const openAddDialog = () => {
    setEditingTest(emptyTest);
    setDialogOpen(true);
  }
  
  const openEditDialog = (test: TestCatalog) => {
    setEditingTest(test);
    setDialogOpen(true);
  }

  const TestForm = ({ test, onSave } : {test: Partial<TestCatalog>, onSave: (test: Partial<TestCatalog>) => void}) => {
    const [currentTest, setCurrentTest] = useState(test);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(currentTest);
    }
    
    const handleReferenceRangeChange = (index: number, field: string, value: string | number) => {
      const updatedRanges = [...(currentTest.referenceRanges || [])];
      (updatedRanges[index] as any)[field] = value;
      setCurrentTest({ ...currentTest, referenceRanges: updatedRanges });
    };

    const addReferenceRange = () => {
      const newRange = { ageMin: 0, ageMax: 99, gender: 'Any', rangeLow: 0, rangeHigh: 0, units: '' };
      setCurrentTest({ ...currentTest, referenceRanges: [...(currentTest.referenceRanges || []), newRange] });
    };

    const removeReferenceRange = (index: number) => {
      const updatedRanges = [...(currentTest.referenceRanges || [])];
      updatedRanges.splice(index, 1);
      setCurrentTest({ ...currentTest, referenceRanges: updatedRanges });
    };

    return (
        <form onSubmit={handleSubmit}>
            <DialogHeader>
            <DialogTitle>{currentTest._id ? 'Edit Test' : 'Add New Test'}</DialogTitle>
            <DialogDescription>
                Define the test, its requirements, and billing information.
            </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4 max-h-[70vh] overflow-y-auto pr-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="testCode">Test Code</Label>
                        <Input id="testCode" name="testCode" placeholder="e.g., BMP" required value={currentTest.testCode} onChange={(e) => setCurrentTest({...currentTest, testCode: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="name">Test Name</Label>
                        <Input id="name" name="name" placeholder="e.g., Basic Metabolic Panel" required value={currentTest.name} onChange={(e) => setCurrentTest({...currentTest, name: e.target.value})} />
                    </div>
                </div>
                <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" placeholder="A short description of the test's clinical utility." value={currentTest.description} onChange={(e) => setCurrentTest({...currentTest, description: e.target.value})} />
                </div>
                 <div className="flex items-center space-x-2">
                    <Checkbox id="isPanel" checked={currentTest.isPanel} onCheckedChange={(checked) => setCurrentTest({...currentTest, isPanel: !!checked})} />
                    <label
                        htmlFor="isPanel"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                        This test is a panel (group of other tests)
                    </label>
                </div>
                {currentTest.isPanel && (
                     <div className="pl-6 space-y-2">
                        <Label>Panel Components</Label>
                        <Input placeholder="Enter test codes, comma separated (e.g. NA, K, CL)" value={currentTest.panelComponents?.join(', ')} onChange={(e) => setCurrentTest({...currentTest, panelComponents: e.target.value.split(',').map(s => s.trim())})} />
                    </div>
                )}
                
                <Separator />
                
                <h4 className="font-medium">Specimen Requirements</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pl-2">
                    <div className="space-y-2">
                        <Label htmlFor="tubeType">Tube Type</Label>
                        <Select name="tubeType" required value={currentTest.specimenRequirements?.tubeType} onValueChange={(value) => setCurrentTest({...currentTest, specimenRequirements: {...currentTest.specimenRequirements, tubeType: value}})}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select tube type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Lavender Top">Lavender Top (EDTA)</SelectItem>
                            <SelectItem value="Gold Top">Gold Top (SST)</SelectItem>
                            <SelectItem value="Light Blue Top">Light Blue Top (Citrate)</SelectItem>
                            <SelectItem value="Green Top">Green Top (Heparin)</SelectItem>
                        </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="minVolume">Min. Volume</Label>
                        <Input id="minVolume" name="minVolume" type="number" placeholder="e.g. 3" value={currentTest.specimenRequirements?.minVolume} onChange={(e) => setCurrentTest({...currentTest, specimenRequirements: {...currentTest.specimenRequirements, minVolume: parseFloat(e.target.value) || 0 }})} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="volumeUnits">Units</Label>
                        <Input id="volumeUnits" name="volumeUnits" value={currentTest.specimenRequirements?.units} onChange={(e) => setCurrentTest({...currentTest, specimenRequirements: {...currentTest.specimenRequirements, units: e.target.value}})} />
                    </div>
                </div>

                <Separator />

                <h4 className="font-medium">Turnaround Time</h4>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-2">
                    <div className="space-y-4 border p-4 rounded-md">
                        <Label className="font-semibold">Routine</Label>
                         <div className="flex items-center gap-2">
                            <Input id="routineTime" type="number" placeholder="e.g., 24" value={currentTest.turnaroundTime?.routine.value} onChange={(e) => setCurrentTest({...currentTest, turnaroundTime: {...currentTest.turnaroundTime, routine: {...currentTest.turnaroundTime?.routine, value: parseInt(e.target.value) || 0 }}})} />
                            <Select value={currentTest.turnaroundTime?.routine.units} onValueChange={(value) => setCurrentTest({...currentTest, turnaroundTime: {...currentTest.turnaroundTime, routine: {...currentTest.turnaroundTime?.routine, units: value as any}}})}>
                                <SelectTrigger className="w-48">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="minutes">Minutes</SelectItem>
                                    <SelectItem value="hours">Hours</SelectItem>
                                    <SelectItem value="days">Days</SelectItem>
                                </SelectContent>
                            </Select>
                         </div>
                    </div>
                     <div className="space-y-4 border p-4 rounded-md">
                        <Label className="font-semibold">STAT</Label>
                         <div className="flex items-center gap-2">
                            <Input id="statTime" type="number" placeholder="e.g., 1" value={currentTest.turnaroundTime?.stat.value} onChange={(e) => setCurrentTest({...currentTest, turnaroundTime: {...currentTest.turnaroundTime, stat: {...currentTest.turnaroundTime?.stat, value: parseInt(e.target.value) || 0 }}})} />
                            <Select value={currentTest.turnaroundTime?.stat.units} onValueChange={(value) => setCurrentTest({...currentTest, turnaroundTime: {...currentTest.turnaroundTime, stat: {...currentTest.turnaroundTime?.stat, units: value as any}}})}>
                                <SelectTrigger className="w-48">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="minutes">Minutes</SelectItem>
                                    <SelectItem value="hours">Hours</SelectItem>
                                    <SelectItem value="days">Days</SelectItem>
                                </SelectContent>
                            </Select>
                         </div>
                    </div>
                 </div>

                <Separator />
                
                 <div className="space-y-2">
                    <Label htmlFor="price">Price</Label>
                    <Input id="price" name="price" type="number" step="0.01" placeholder="e.g., 75.50" required value={currentTest.price} onChange={(e) => setCurrentTest({...currentTest, price: parseFloat(e.target.value) || 0})} />
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium">Demographic-Specific Reference Ranges</h4>
                  <div className="space-y-2 mt-2">
                    {(currentTest.referenceRanges || []).map((range, index) => (
                      <div key={index} className="grid grid-cols-12 gap-2 items-center p-2 rounded-md border">
                        <div className="col-span-3 space-y-1">
                          <Label className="text-xs">Age Range</Label>
                          <div className="flex items-center gap-1">
                            <Input type="number" placeholder="Min" value={range.ageMin} onChange={(e) => handleReferenceRangeChange(index, 'ageMin', parseInt(e.target.value) || 0)} />
                            <span className="text-muted-foreground">-</span>
                            <Input type="number" placeholder="Max" value={range.ageMax} onChange={(e) => handleReferenceRangeChange(index, 'ageMax', parseInt(e.target.value) || 0)} />
                          </div>
                        </div>
                        <div className="col-span-2 space-y-1">
                           <Label className="text-xs">Gender</Label>
                           <Select value={range.gender} onValueChange={(value) => handleReferenceRangeChange(index, 'gender', value)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Any">Any</SelectItem>
                              <SelectItem value="Male">Male</SelectItem>
                              <SelectItem value="Female">Female</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                         <div className="col-span-4 space-y-1">
                          <Label className="text-xs">Reference Range</Label>
                          <div className="flex items-center gap-1">
                            <Input type="number" step="any" placeholder="Low" value={range.rangeLow} onChange={(e) => handleReferenceRangeChange(index, 'rangeLow', parseFloat(e.target.value) || 0)} />
                             <span className="text-muted-foreground">-</span>
                            <Input type="number" step="any" placeholder="High" value={range.rangeHigh} onChange={(e) => handleReferenceRangeChange(index, 'rangeHigh', parseFloat(e.target.value) || 0)} />
                          </div>
                        </div>
                        <div className="col-span-2 space-y-1">
                           <Label className="text-xs">Units</Label>
                          <Input placeholder="e.g. mg/dL" value={range.units} onChange={(e) => handleReferenceRangeChange(index, 'units', e.target.value)} />
                        </div>
                        <div className="col-span-1 flex justify-end">
                           <Button variant="ghost" size="icon" onClick={() => removeReferenceRange(index)} className="mt-4">
                            <X className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    <Button type="button" variant="outline" size="sm" onClick={addReferenceRange}>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add Reference Range
                    </Button>
                  </div>
                </div>

                 <div className="p-4 border-dashed border-2 rounded-lg text-center bg-muted/50">
                    <p className="text-sm text-muted-foreground">Automated reflex testing rules will be managed here.</p>
                </div>
            </div>
            <DialogFooter className="pt-4">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button type="submit">Save Test</Button>
            </DialogFooter>
        </form>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="font-headline text-3xl font-semibold">Test Catalog Management</h1>
        <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
            <Button onClick={openAddDialog}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add New Test
            </Button>
          <DialogContent className="sm:max-w-4xl">
             {editingTest && <TestForm test={editingTest} onSave={handleSaveTest} />}
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Laboratory Test Catalog</CardTitle>
          <CardDescription>
            The master dictionary of all tests offered by the laboratory.
          </CardDescription>
          <div className="relative pt-4">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tests by name or code..."
              className="pl-8"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Test Code</TableHead>
                <TableHead>Test Name</TableHead>
                <TableHead>Specimen</TableHead>
                <TableHead>Price</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      <div className="flex justify-center items-center gap-2">
                        <Icons.logo className="h-5 w-5 animate-spin" />
                        <span>Loading tests...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                tests.map((test) => (
                  <TableRow key={test._id}>
                    <TableCell className="font-medium font-code">
                      {test.testCode}
                    </TableCell>
                    <TableCell>{test.name}</TableCell>
                    <TableCell>{test.specimenRequirements.tubeType}</TableCell>
                    <TableCell>{`$${test.price.toFixed(2)}`}</TableCell>
                    <TableCell className="text-right">
                       <Button variant="ghost" size="icon" onClick={() => openEditDialog(test)}>
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit Test</span>
                      </Button>
                      <AlertDialog>
                          <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon">
                              <Trash2 className="h-4 w-4 text-destructive" />
                              <span className="sr-only">Delete Test</span>
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action will permanently delete the test "{test.name}". This cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteTest(test._id)}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
