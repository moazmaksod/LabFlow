
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
  DialogTrigger,
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
import { Edit, PlusCircle, Search } from 'lucide-react';
import React, { useState } from 'react';
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

type Test = {
  id: string;
  testCode: string;
  name: string;
  description: string;
  specimenRequirements: {
    tubeType: string;
    minVolume: number;
    units: string;
  };
  turnaroundTime: {
    routine: { value: number; units: string };
    stat: { value: number; units: string };
  };
  price: number;
  isPanel: boolean;
};

const initialTests: Test[] = [
  {
    id: 'test-1',
    testCode: 'CBC',
    name: 'Complete Blood Count',
    description: 'A test that measures the cells that make up your blood.',
    specimenRequirements: {
      tubeType: 'Lavender Top',
      minVolume: 3,
      units: 'mL',
    },
    turnaroundTime: {
      routine: { value: 4, units: 'hours' },
      stat: { value: 1, units: 'hours' },
    },
    price: 50.0,
    isPanel: false,
  },
  {
    id: 'test-2',
    testCode: 'LP',
    name: 'Lipid Panel',
    description:
      'Measures fats and fatty substances used as a source of energy by your body.',
    specimenRequirements: {
      tubeType: 'Gold Top',
      minVolume: 5,
      units: 'mL',
    },
    turnaroundTime: {
      routine: { value: 8, units: 'hours' },
      stat: { value: 2, units: 'hours' },
    },
    price: 100.0,
    isPanel: true,
  },
  {
    id: 'test-3',
    testCode: 'TSH',
    name: 'Thyroid Stimulating Hormone',
    description: 'Checks your thyroid gland function.',
    specimenRequirements: {
      tubeType: 'Gold Top',
      minVolume: 5,
      units: 'mL',
    },
    turnaroundTime: {
      routine: { value: 6, units: 'hours' },
      stat: { value: 1, units: 'hours' },
    },
    price: 120.0,
    isPanel: false,
  },
];

const emptyTest: Test = {
    id: '',
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
}

export default function TestCatalogPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [tests, setTests] = useState<Test[]>(initialTests);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [editingTest, setEditingTest] = useState<Test | null>(null);

  React.useEffect(() => {
    if (user && user.role !== 'manager') {
      router.push('/dashboard');
    }
  }, [user, router]);

  if (user?.role !== 'manager') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  const handleSaveTest = (testToSave: Test) => {
    if (editingTest && editingTest.id) {
        // Update existing test
        setTests(tests.map(t => t.id === editingTest.id ? testToSave : t));
    } else {
        // Add new test
        setTests([...tests, { ...testToSave, id: `test-${Date.now()}` }]);
    }
    setEditingTest(null);
    setDialogOpen(false);
  };
  
  const openAddDialog = () => {
    setEditingTest({ ...emptyTest, id: '' });
    setDialogOpen(true);
  }
  
  const openEditDialog = (test: Test) => {
    setEditingTest(test);
    setDialogOpen(true);
  }

  const TestForm = ({ test, onSave, onCancel } : {test: Test, onSave: (test: Test) => void, onCancel: () => void}) => {
    const [currentTest, setCurrentTest] = useState<Test>(test);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(currentTest);
    }

    return (
        <form onSubmit={handleSubmit}>
            <DialogHeader>
            <DialogTitle>{test.id ? 'Edit Test' : 'Add New Test'}</DialogTitle>
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
                        <Input placeholder="Enter test codes, comma separated (e.g. NA, K, CL)" />
                    </div>
                )}
                
                <Separator />
                
                <h4 className="font-medium">Specimen Requirements</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pl-2">
                    <div className="space-y-2">
                        <Label htmlFor="tubeType">Tube Type</Label>
                        <Select name="tubeType" required value={currentTest.specimenRequirements.tubeType} onValueChange={(value) => setCurrentTest({...currentTest, specimenRequirements: {...currentTest.specimenRequirements, tubeType: value}})}>
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
                        <Input id="minVolume" name="minVolume" type="number" placeholder="e.g. 3" value={currentTest.specimenRequirements.minVolume} onChange={(e) => setCurrentTest({...currentTest, specimenRequirements: {...currentTest.specimenRequirements, minVolume: parseFloat(e.target.value) || 0 }})} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="volumeUnits">Units</Label>
                        <Input id="volumeUnits" name="volumeUnits" value={currentTest.specimenRequirements.units} onChange={(e) => setCurrentTest({...currentTest, specimenRequirements: {...currentTest.specimenRequirements, units: e.target.value}})} />
                    </div>
                </div>

                <Separator />

                <h4 className="font-medium">Turnaround Time</h4>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-2">
                    <div className="space-y-4 border p-4 rounded-md">
                        <Label className="font-semibold">Routine</Label>
                         <div className="flex items-center gap-2">
                            <Input id="routineTime" type="number" placeholder="e.g., 24" value={currentTest.turnaroundTime.routine.value} onChange={(e) => setCurrentTest({...currentTest, turnaroundTime: {...currentTest.turnaroundTime, routine: {...currentTest.turnaroundTime.routine, value: parseInt(e.target.value) || 0 }}})} />
                            <Select value={currentTest.turnaroundTime.routine.units} onValueChange={(value) => setCurrentTest({...currentTest, turnaroundTime: {...currentTest.turnaroundTime, routine: {...currentTest.turnaroundTime.routine, units: value}}})}>
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
                            <Input id="statTime" type="number" placeholder="e.g., 1" value={currentTest.turnaroundTime.stat.value} onChange={(e) => setCurrentTest({...currentTest, turnaroundTime: {...currentTest.turnaroundTime, stat: {...currentTest.turnaroundTime.stat, value: parseInt(e.target.value) || 0 }}})} />
                            <Select value={currentTest.turnaroundTime.stat.units} onValueChange={(value) => setCurrentTest({...currentTest, turnaroundTime: {...currentTest.turnaroundTime, stat: {...currentTest.turnaroundTime.stat, units: value}}})}>
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

                {/* Placeholder for future complex fields */}
                <div className="p-4 border-dashed border-2 rounded-lg text-center bg-muted/50">
                    <p className="text-sm text-muted-foreground">Demographic-specific reference ranges will be managed here.</p>
                </div>
                 <div className="p-4 border-dashed border-2 rounded-lg text-center bg-muted/50">
                    <p className="text-sm text-muted-foreground">Automated reflex testing rules will be managed here.</p>
                </div>
            </div>
            <DialogFooter className="pt-4">
                <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
                <Button type="submit">Save Test</Button>
            </DialogFooter>
        </form>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="font-headline text-3xl font-semibold">Test Catalog Management</h1>
        
            <Button onClick={openAddDialog}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add New Test
            </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
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
                {tests.map((test) => (
                    <TableRow key={test.id}>
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
                    </TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
            </CardContent>
        </Card>
        <DialogContent className="sm:max-w-3xl">
            {editingTest && <TestForm test={editingTest} onSave={handleSaveTest} onCancel={() => setDialogOpen(false)} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}
