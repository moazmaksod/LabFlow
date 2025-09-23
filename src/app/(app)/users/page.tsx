
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAuth } from '@/hooks/use-auth';
import type { User } from '@/lib/schemas/auth';
import { Edit, PlusCircle, Search } from 'lucide-react';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';

const initialUsers: User[] = [
  {
    id: '1',
    firstName: 'Jane',
    lastName: 'Doe',
    email: 'jane.doe@labflow.med',
    role: 'manager',
  },
  {
    id: '2',
    firstName: 'Sam',
    lastName: 'Wilson',
    email: 'sam.wilson@labflow.med',
    role: 'receptionist',
  },
  {
    id: '3',
    firstName: 'Bruce',
    lastName: 'Banner',
    email: 'bruce.banner@labflow.med',
    role: 'technician',
  },
  {
    id: '4',
    firstName: 'Dr. Stephen',
    lastName: 'Strange',
    email: 'dr.strange@clinic.com',
    role: 'physician',
  },
];

export default function UserManagementPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>(initialUsers);
  
  const [isAddUserOpen, setAddUserOpen] = useState(false);
  const [isEditUserOpen, setEditUserOpen] = useState(false);

  const [newUser, setNewUser] = useState({ firstName: '', lastName: '', email: '', role: '' });
  const [editingUser, setEditingUser] = useState<User | null>(null);

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

  const handleAddUser = (event: React.FormEvent) => {
    event.preventDefault();
    if (newUser.firstName && newUser.lastName && newUser.email && newUser.role) {
      setUsers([...users, { ...newUser, id: `user-${users.length + 1}` } as User]);
      setNewUser({ firstName: '', lastName: '', email: '', role: '' });
      setAddUserOpen(false);
    }
  };

  const handleUpdateUser = () => {
    if (editingUser) {
      setUsers(users.map(u => u.id === editingUser.id ? editingUser : u));
      setEditingUser(null);
      setEditUserOpen(false);
    }
  };


  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="font-headline text-3xl font-semibold">User Management</h1>
        <Dialog open={isAddUserOpen} onOpenChange={setAddUserOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add New User
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleAddUser}>
              <DialogHeader>
                <DialogTitle>Add New User</DialogTitle>
                <DialogDescription>
                  Enter the user's details and assign a role. An invitation will be sent to their email.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="firstName" className="text-right">
                    First Name
                  </Label>
                  <Input id="firstName" value={newUser.firstName} onChange={(e) => setNewUser({...newUser, firstName: e.target.value})} className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="lastName" className="text-right">
                    Last Name
                  </Label>
                  <Input id="lastName" value={newUser.lastName} onChange={(e) => setNewUser({...newUser, lastName: e.target.value})} className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">
                    Email
                  </Label>
                  <Input id="email" type="email" value={newUser.email} onChange={(e) => setNewUser({...newUser, email: e.target.value})} className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="role" className="text-right">
                    Role
                  </Label>
                  <Select onValueChange={(value) => setNewUser({...newUser, role: value})} required>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="technician">Technician</SelectItem>
                      <SelectItem value="receptionist">Receptionist</SelectItem>
                      <SelectItem value="physician">Physician</SelectItem>
                      <SelectItem value="patient">Patient</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setAddUserOpen(false)}>Cancel</Button>
                <Button type="submit">Add User</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System Users</CardTitle>
          <CardDescription>
            A list of all users with access to LabFlow.
          </CardDescription>
          <div className="relative pt-4">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users by name or email..."
              className="pl-8"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Dialog open={isEditUserOpen} onOpenChange={setEditUserOpen}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Full Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.firstName} {user.lastName}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell className="capitalize">{user.role}</TableCell>
                    <TableCell className="text-right">
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="icon" onClick={() => setEditingUser(user)}>
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit User</span>
                          </Button>
                        </DialogTrigger>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
             <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Edit User</DialogTitle>
                  <DialogDescription>
                    Update the role for {editingUser?.firstName} {editingUser?.lastName}.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                   <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="edit-role" className="text-right">
                        Role
                      </Label>
                      <Select value={editingUser?.role} onValueChange={(value) => setEditingUser(current => current ? {...current, role: value as User['role']} : null)}>
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="manager">Manager</SelectItem>
                          <SelectItem value="technician">Technician</SelectItem>
                          <SelectItem value="receptionist">Receptionist</SelectItem>
                          <SelectItem value="physician">Physician</SelectItem>
                          <SelectItem value="patient">Patient</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setEditUserOpen(false)}>Cancel</Button>
                  <Button type="button" onClick={handleUpdateUser}>Save Changes</Button>
                </DialogFooter>
              </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}

    