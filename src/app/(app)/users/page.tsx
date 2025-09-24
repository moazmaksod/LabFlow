
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
import { Edit, PlusCircle, Search, Trash2 } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Icons } from '@/components/icons';


export default function UserManagementPage() {
  const { user, token } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isAddUserOpen, setAddUserOpen] = useState(false);
  const [isEditUserOpen, setEditUserOpen] = useState(false);

  const [newUser, setNewUser] = useState<Omit<User, '_id'>>({ firstName: '', lastName: '', email: '', role: 'receptionist' });
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const fetchUsers = async () => {
    if (!user || !token || user.role !== 'manager') {
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      const response = await fetch('/api/v1/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const result = await response.json();
        setUsers(result.data);
      } else {
        const errorData = await response.json();
        toast({
          variant: 'destructive',
          title: 'Failed to fetch users',
          description: errorData.message || 'Could not retrieve user data from the server.'
        });
      }
    } catch (error) {
      console.error("An error occurred while fetching users:", error);
      toast({
        variant: 'destructive',
        title: 'An error occurred while fetching users.',
        description: 'Please check the console for more details.'
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
      fetchUsers();
    }
  }, [user, token]);

  
  if (!user || user.role !== 'manager') {
    return (
       <div className="flex min-h-screen items-center justify-center">
         <div className="flex items-center gap-2">
           <Icons.logo className="size-8 animate-spin" />
           <span className="text-lg font-semibold">Loading...</span>
         </div>
       </div>
    );
  }

  const handleAddUser = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const response = await fetch('/api/v1/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newUser),
      });

      if (response.ok) {
        const createdUser = await response.json();
        setUsers(currentUsers => [...currentUsers, createdUser.data]);
        toast({ title: 'User created successfully!' });
        setNewUser({ firstName: '', lastName: '', email: '', role: 'receptionist' });
        setAddUserOpen(false);
      } else {
        const errorData = await response.json();
        toast({
          variant: 'destructive',
          title: 'Failed to create user',
          description: errorData.message || 'Please try again.',
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'An error occurred.',
      });
    }
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;
    
    const url = `/api/v1/users/${editingUser._id}`;
    const body = JSON.stringify({ role: editingUser.role });

    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: body,
      });

      if (response.ok) {
        toast({ title: 'User updated successfully!' });
        fetchUsers();
        setEditUserOpen(false);
        setEditingUser(null);
      } else {
        const errorText = await response.text();
        console.error("[DEBUG] Frontend: Update failed. Status:", response.status, "Body:", errorText);
        toast({
          variant: 'destructive',
          title: 'Failed to update user',
          description: `Server responded with status ${response.status}. Check console for details.`,
        });
      }
    } catch (error) {
       console.error("[DEBUG] Frontend: Catch block error on update:", error);
       toast({
        variant: 'destructive',
        title: 'An error occurred during update.',
        description: 'Check the console for network error details.'
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/v1/users/${userId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setUsers(currentUsers => currentUsers.filter(u => u._id !== userId));
        toast({ title: 'User deleted successfully!' });
      } else {
         toast({
          variant: 'destructive',
          title: 'Failed to delete user',
        });
      }
    } catch (error) {
       toast({
        variant: 'destructive',
        title: 'An error occurred.',
      });
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
                  <Select onValueChange={(value) => setNewUser({...newUser, role: value as User['role']})} defaultValue={newUser.role} required>
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
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      <div className="flex justify-center items-center gap-2">
                        <Icons.logo className="h-5 w-5 animate-spin" />
                        <span>Loading users...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((u) => (
                    <TableRow key={u._id}>
                      <TableCell className="font-medium">
                        {u.firstName} {u.lastName}
                      </TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell className="capitalize">{u.role}</TableCell>
                      <TableCell className="text-right space-x-1">
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={() => setEditingUser(u)}>
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Edit User</span>
                            </Button>
                          </DialogTrigger>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                               <Button variant="ghost" size="icon" disabled={u._id === user?._id}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                                <span className="sr-only">Deactivate User</span>
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action will permanently delete the user {u.firstName} {u.lastName}. This cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteUser(u._id)}>Delete</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
             <DialogContent className="sm:max-w-[425px]">
                {editingUser && (
                  <>
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
                  </>
                )}
              </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}
