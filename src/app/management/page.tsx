
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
import { Edit, Facebook, Globe, Instagram, Linkedin, PlusCircle, Twitter } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import React, { useState } from 'react';

const initialTests = [
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

const initialUsers = [
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

const initialItemTypes = [
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
  {
    name: 'TSH Immunoassay',
    category: 'Reagents',
    supplier: 'Supplier C',
    minLevel: 20,
  }
];

type User = {
  name: string;
  role: string;
  email: string;
};

export default function ManagementPage() {
  const [tests, setTests] = useState(initialTests);
  const [newTest, setNewTest] = useState({ name: '', price: '', range: '', kit: '' });
  const [itemTypes, setItemTypes] = useState(initialItemTypes);
  const [newItemType, setNewItemType] = useState({ name: '', category: '', supplier: '', minLevel: 0 });
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [newUser, setNewUser] = useState<Omit<User, 'email'> & { email?: string }>({ name: '', role: ''});
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const handleAddTest = () => {
    if (newTest.name && newTest.price) {
      setTests([...tests, newTest]);
      setNewTest({ name: '', price: '', range: '', kit: '' });
    }
  };

  const handleAddNewItemType = () => {
    if (newItemType.name && newItemType.category && newItemType.minLevel > 0) {
      setItemTypes([...itemTypes, newItemType]);
      setNewItemType({ name: '', category: '', supplier: '', minLevel: 0 });
    }
  };

  const handleAddUser = () => {
    if (newUser.name && newUser.email && newUser.role) {
        setUsers([...users, newUser as User]);
        setNewUser({ name: '', email: '', role: '' });
    }
  };

  const handleUpdateUser = () => {
    if (editingUser) {
        setUsers(users.map(u => u.email === editingUser.email ? editingUser : u));
        setEditingUser(null);
    }
  };


  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-headline text-3xl font-semibold">Management</h1>

      <Tabs defaultValue="tests" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="tests">Test Information</TabsTrigger>
          <TabsTrigger value="inventory">Inventory Items</TabsTrigger>
          <TabsTrigger value="users">Users & Roles</TabsTrigger>
          <TabsTrigger value="lab-info">Lab Info</TabsTrigger>
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
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add New Test
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Add New Test</DialogTitle>
                      <DialogDescription>
                        Fill in the details of the new test.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="test-name" className="text-right">
                          Name
                        </Label>
                        <Input
                          id="test-name"
                          value={newTest.name}
                          onChange={(e) => setNewTest({ ...newTest, name: e.target.value })}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="test-price" className="text-right">
                          Price (SAR)
                        </Label>
                        <Input
                          id="test-price"
                           type="number"
                          value={newTest.price.replace('SAR ','')}
                          onChange={(e) => setNewTest({ ...newTest, price: `SAR ${e.target.value}` })}
                          className="col-span-3"
                        />
                      </div>
                       <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="test-range" className="text-right">
                          Normal Range
                        </Label>
                        <Input
                          id="test-range"
                          value={newTest.range}
                           onChange={(e) => setNewTest({ ...newTest, range: e.target.value })}
                          className="col-span-3"
                        />
                      </div>
                       <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="test-kit" className="text-right">
                          Kit Used
                        </Label>
                         <Select onValueChange={(value) => setNewTest({ ...newTest, kit: value })}>
                          <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Select a kit" />
                          </SelectTrigger>
                          <SelectContent>
                            {itemTypes.map((item) => (
                                <SelectItem key={item.name} value={item.name}>{item.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit" onClick={handleAddTest}>Add Test</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
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
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>Inventory Item Management</CardTitle>
                  <CardDescription>
                    Define the types of items your lab uses. This is the catalog of
                    all reagents, consumables, etc.
                  </CardDescription>
                </div>
                 <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add Item Type
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Add New Item Type</DialogTitle>
                      <DialogDescription>
                        Fill in the details of the new item type.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="item-name" className="text-right">
                          Item Name
                        </Label>
                        <Input
                          id="item-name"
                          placeholder="e.g., Pipette Tips 1000uL"
                          value={newItemType.name}
                          onChange={(e) => setNewItemType({ ...newItemType, name: e.target.value })}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="item-category" className="text-right">
                          Category
                        </Label>
                        <Select onValueChange={(value) => setNewItemType({ ...newItemType, category: value })}>
                          <SelectTrigger id="item-category" className="col-span-3">
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Reagents">Reagents</SelectItem>
                            <SelectItem value="Consumables">Consumables</SelectItem>
                            <SelectItem value="Controls">Controls</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="item-supplier" className="text-right">
                          Supplier
                        </Label>
                        <Input
                          id="item-supplier"
                          placeholder="e.g., Supplier C"
                          value={newItemType.supplier}
                          onChange={(e) => setNewItemType({ ...newItemType, supplier: e.target.value })}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="item-min-level" className="text-right">
                          Min. Level
                        </Label>
                        <Input
                          id="item-min-level"
                          type="number"
                          placeholder="e.g., 10"
                          value={newItemType.minLevel || ''}
                          onChange={(e) => setNewItemType({ ...newItemType, minLevel: parseInt(e.target.value, 10) || 0 })}
                          className="col-span-3"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit" onClick={handleAddNewItemType}>Add Item Type</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
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
                 <Dialog>
                    <DialogTrigger asChild>
                        <Button>
                          <PlusCircle className="mr-2 h-4 w-4" />
                          Add New User
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                        <DialogTitle>Add New User</DialogTitle>
                        <DialogDescription>
                            Enter the user's details and assign a role.
                        </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="new-user-name" className="text-right">Name</Label>
                                <Input id="new-user-name" value={newUser.name} onChange={(e) => setNewUser({...newUser, name: e.target.value})} className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="new-user-email" className="text-right">Email</Label>
                                <Input id="new-user-email" type="email" value={newUser.email || ''} onChange={(e) => setNewUser({...newUser, email: e.target.value})} className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="new-user-role" className="text-right">Role</Label>
                                <Select onValueChange={(value) => setNewUser({...newUser, role: value})}>
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="Select a role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Administrator">Administrator</SelectItem>
                                        <SelectItem value="Technician">Technician</SelectItem>
                                        <SelectItem value="Receptionist">Receptionist</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="submit" onClick={handleAddUser}>Add User</Button>
                        </DialogFooter>
                    </DialogContent>
                 </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.email}>
                      <TableCell className="font-medium">
                        {user.name}
                      </TableCell>
                      <TableCell>{user.role}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell className="text-right">
                         <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="ghost" size="icon" onClick={() => setEditingUser({...user})}>
                                    <Edit className="h-4 w-4" />
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                <DialogTitle>Edit User Role</DialogTitle>
                                <DialogDescription>
                                    Update the role for {editingUser?.name}.
                                </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="edit-user-role" className="text-right">Role</Label>
                                        <Select value={editingUser?.role} onValueChange={(value) => setEditingUser(current => current ? {...current, role: value} : null)}>
                                            <SelectTrigger className="col-span-3">
                                                <SelectValue placeholder="Select a role" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Administrator">Administrator</SelectItem>
                                                <SelectItem value="Technician">Technician</SelectItem>
                                                <SelectItem value="Receptionist">Receptionist</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button type="submit" onClick={handleUpdateUser}>Save Changes</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="lab-info">
          <Card>
            <CardHeader>
              <CardTitle>Lab Information</CardTitle>
              <CardDescription>
                Update your lab's public information and branding.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="space-y-4">
                  <div className="grid w-full max-w-lg items-center gap-1.5">
                    <Label htmlFor="lab-name">Lab Name</Label>
                    <Input
                      type="text"
                      id="lab-name"
                      defaultValue="Global Diagnostics Lab"
                    />
                  </div>
                  <div className="grid w-full max-w-lg items-center gap-1.5">
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
              </div>
              <div className="space-y-4">
                <Label>Social Media</Label>
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <Twitter className="h-5 w-5 text-muted-foreground" />
                        <Input placeholder="https://twitter.com/labflow" className="max-w-md" />
                    </div>
                     <div className="flex items-center gap-2">
                        <Facebook className="h-5 w-5 text-muted-foreground" />
                        <Input placeholder="https://facebook.com/labflow" className="max-w-md" />
                    </div>
                     <div className="flex items-center gap-2">
                        <Instagram className="h-5 w-5 text-muted-foreground" />
                        <Input placeholder="https://instagram.com/labflow" className="max-w-md" />
                    </div>
                    <div className="flex items-center gap-2">
                        <Linkedin className="h-5 w-5 text-muted-foreground" />
                        <Input placeholder="https://linkedin.com/company/labflow" className="max-w-md" />
                    </div>
                     <div className="flex items-center gap-2">
                        <Globe className="h-5 w-5 text-muted-foreground" />
                        <Input placeholder="https://labflow.med" className="max-w-md" />
                    </div>
                </div>
              </div>
              <Button>Save Lab Info</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );

    

    