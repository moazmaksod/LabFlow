
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

type Test = {
  testCode: string;
  name: string;
  description: string;
  tubeType: string;
  price: number;
};

const initialTests: Test[] = [
  {
    testCode: 'CBC',
    name: 'Complete Blood Count',
    description: 'A test that measures the cells that make up your blood.',
    tubeType: 'Lavender Top',
    price: 50.0,
  },
  {
    testCode: 'LP',
    name: 'Lipid Panel',
    description: 'Measures fats and fatty substances used as a source of energy by your body.',
    tubeType: 'Gold Top',
    price: 100.0,
  },
  {
    testCode: 'TSH',
    name: 'Thyroid Stimulating Hormone',
    description: 'Checks your thyroid gland function.',
    tubeType: 'Gold Top',
    price: 120.0,
  },
];

export default function TestCatalogPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [tests, setTests] = useState<Test[]>(initialTests);
  const [isDialogOpen, setDialogOpen] = useState(false);

  React.useEffect(() => {
    if (user && user.role !== 'manager') {
      router.push('/dashboard');
    }
  }, [user, router]);

  if (user?.role !== 'manager') {
    return null;
  }

  const handleAddTest = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const newTest: Test = {
      testCode: formData.get('testCode') as string,
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      tubeType: formData.get('tubeType') as string,
      price: parseFloat(formData.get('price') as string),
    };
    setTests([...tests, newTest]);
    setDialogOpen(false);
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="font-headline text-3xl font-semibold">Test Catalog Management</h1>
        <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add New Test
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl">
            <form onSubmit={handleAddTest}>
              <DialogHeader>
                <DialogTitle>Add New Test</DialogTitle>
                <DialogDescription>
                  Define a new test, its requirements, and billing information.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="testCode">Test Code</Label>
                        <Input id="testCode" name="testCode" placeholder="e.g., BMP" required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="name">Test Name</Label>
                        <Input id="name" name="name" placeholder="e.g., Basic Metabolic Panel" required />
                    </div>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" name="description" placeholder="A short description of the test's clinical utility." />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="tubeType">Specimen Tube Type</Label>
                        <Select name="tubeType" required>
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
                        <Label htmlFor="price">Price</Label>
                        <Input id="price" name="price" type="number" step="0.01" placeholder="e.g., 75.50" required />
                    </div>
                </div>
                {/* Add fields for reference ranges and reflex rules here in a future step */}
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button type="submit">Add Test</Button>
              </DialogFooter>
            </form>
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
              {tests.map((test) => (
                <TableRow key={test.testCode}>
                  <TableCell className="font-medium font-code">
                    {test.testCode}
                  </TableCell>
                  <TableCell>{test.name}</TableCell>
                  <TableCell>{test.tubeType}</TableCell>
                   <TableCell>{test.price.toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon">
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
    </div>
  );
}
