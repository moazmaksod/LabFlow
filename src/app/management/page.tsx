
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
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { PlusCircle } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const tests = [
  {
    name: 'Complete Blood Count (CBC)',
    price: 'SAR 50.00',
    range: 'Varies',
    kit: 'CBC Reagent Kit',
  },
  {
    name: 'Lipid Profile',
    price: 'SAR 100.00',
    range: 'Varies',
    kit: 'Lipid Panel Reagent',
  },
  {
    name: 'Thyroid Stimulating Hormone (TSH)',
    price: 'SAR 120.00',
    range: '0.4-4.0 mIU/L',
    kit: 'TSH Immunoassay',
  },
];

const users = [
  {
    name: 'Dr. Jane Doe',
    role: 'Administrator',
    email: 'jane.doe@labflow.med',
  },
  { name: 'Sam Wilson', role: 'Receptionist', email: 'sam.wilson@labflow.med' },
  {
    name: 'Bruce Banner',
    role: 'Technician',
    email: 'bruce.banner@labflow.med',
  },
];

const itemTypes = [
  {
    name: 'CBC Reagent Kit',
    category: 'Reagents',
    supplier: 'Supplier A',
    minLevel: 10,
  },
  {
    name: 'EDTA Tube (Purple Top)',
    category: 'Consumables',
    supplier: 'Supplier B',
    minLevel: 100,
  },
  {
    name: 'Lipid Panel Reagent',
    category: 'Reagents',
    supplier: 'Supplier A',
    minLevel: 10,
  },
];

export default function ManagementPage() {
  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-headline text-3xl font-semibold">Management</h1>

      <Tabs defaultValue="tests" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="tests">Test Information</TabsTrigger>
          <TabsTrigger value="inventory">Inventory Items</TabsTrigger>
          <TabsTrigger value="users">Users & Roles</TabsTrigger>
          <TabsTrigger value="general">General Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="tests">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>Test Information</CardTitle>
                  <CardDescription>
                    Manage lab tests, prices, normal ranges, and required kits.
                  </CardDescription>
                </div>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add New Test
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Test Name</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Normal Range</TableHead>
                    <TableHead>Kit Used</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tests.map((test) => (
                    <TableRow key={test.name}>
                      <TableCell className="font-medium">{test.name}</TableCell>
                      <TableCell>{test.price}</TableCell>
                      <TableCell>{test.range}</TableCell>
                      <TableCell>{test.kit}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="inventory">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Item Management</CardTitle>
              <CardDescription>
                Define the types of items your lab uses. This is the catalog of
                all reagents, consumables, etc.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">
                    Add New Item Type
                  </h3>
                  <div className="grid gap-2">
                    <Label htmlFor="item-name">Item Name</Label>
                    <Input id="item-name" placeholder="e.g., Pipette Tips 1000uL" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="item-category">Category</Label>
                    <Select>
                      <SelectTrigger id="item-category">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Reagents">Reagents</SelectItem>
                        <SelectItem value="Consumables">Consumables</SelectItem>
                        <SelectItem value="Controls">Controls</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="item-supplier">Supplier (Optional)</Label>
                    <Input id="item-supplier" placeholder="e.g., Supplier C" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="item-min-level">Minimum Stock Level</Label>
                    <Input id="item-min-level" type="number" placeholder="e.g., 10" />
                  </div>
                  <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Item Type
                  </Button>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Existing Item Types</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Supplier</TableHead>
                      <TableHead>Min. Stock Level</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {itemTypes.map((item) => (
                      <TableRow key={item.name}>
                        <TableCell className="font-medium">
                          {item.name}
                        </TableCell>
                        <TableCell>{item.category}</TableCell>
                        <TableCell>{item.supplier}</TableCell>
                        <TableCell>{item.minLevel}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>Users & Roles</CardTitle>
                  <CardDescription>
                    Manage user accounts and permissions.
                  </CardDescription>
                </div>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Invite User
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Email</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.name}>
                      <TableCell className="font-medium">
                        {user.name}
                      </TableCell>
                      <TableCell>{user.role}</TableCell>
                      <TableCell>{user.email}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Update your lab's information and branding.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="lab-name">Lab Name</Label>
                <Input
                  type="text"
                  id="lab-name"
                  defaultValue="Global Diagnostics Lab"
                />
              </div>
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="contact-info">Contact Information</Label>
                <Input
                  type="text"
                  id="contact-info"
                  defaultValue="123 Health St, Riyadh | +966 11 234 5678"
                />
              </div>
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="picture">Lab Logo</Label>
                <Input id="picture" type="file" />
              </div>
              <Button>Save Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
