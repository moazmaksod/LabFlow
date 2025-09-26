
'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PlaceHolderImages } from '@/lib/images';
import { Loader2, Moon, Sun, SunMoon } from 'lucide-react';
import { useTheme } from "next-themes"
import { useAuth } from '@/hooks/use-auth';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { UpdatePasswordFormData, UpdateProfileFormData } from '@/lib/schemas/user';
import { UpdatePasswordFormSchema, UpdateProfileFormSchema } from '@/lib/schemas/user';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';

export default function ProfilePage() {
  const userAvatar = PlaceHolderImages.find(
    (img) => img.id === 'user-avatar-1'
  );
  const { theme, setTheme } = useTheme();
  const { user, token, loading, login } = useAuth();
  const { toast } = useToast();

  const profileForm = useForm<UpdateProfileFormData>({
    resolver: zodResolver(UpdateProfileFormSchema),
    defaultValues: {
      fullName: '',
      email: '',
    },
  });

  const passwordForm = useForm<UpdatePasswordFormData>({
    resolver: zodResolver(UpdatePasswordFormSchema),
    defaultValues: {
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    }
  });
  
  useEffect(() => {
    if (user) {
        profileForm.reset({
            fullName: user.fullName,
            email: user.email,
        });
    }
  }, [user, profileForm]);

  const onProfileSubmit = async (data: UpdateProfileFormData) => {
    try {
      const response = await fetch('/api/v1/users/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const { updatedToken } = await response.json();
        login(updatedToken); // Update the auth context with the new user info
        toast({ title: 'Profile updated successfully!' });
      } else {
        const errorData = await response.json();
        toast({ variant: 'destructive', title: 'Update failed', description: errorData.message });
      }
    } catch (error) {
       toast({ variant: 'destructive', title: 'An error occurred.' });
    }
  };

  const onPasswordSubmit = async (data: UpdatePasswordFormData) => {
     try {
      const response = await fetch('/api/v1/users/me/change-password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast({ title: 'Password changed successfully!' });
        passwordForm.reset();
      } else {
        const errorData = await response.json();
        toast({ variant: 'destructive', title: 'Failed to change password', description: errorData.message });
      }
    } catch (error) {
       toast({ variant: 'destructive', title: 'An error occurred.' });
    }
  }
  
  const getInitials = (fullName: string) => {
    if (!fullName) return '';
    const names = fullName.split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return `${names[0].charAt(0)}${names[names.length - 1].charAt(0)}`.toUpperCase();
  }

  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-headline text-3xl font-semibold">
        Profile & Settings
      </h1>

      <div className="grid gap-8">
        <Form {...profileForm}>
            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)}>
                <Card>
                    <CardHeader>
                        <CardTitle>Profile Information</CardTitle>
                        <CardDescription>Update your personal details.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center gap-4">
                            <Avatar className="h-20 w-20">
                                {userAvatar && (
                                    <AvatarImage
                                        src={userAvatar.imageUrl}
                                        alt="User avatar"
                                        data-ai-hint={userAvatar.imageHint}
                                    />
                                )}
                                <AvatarFallback>{user ? getInitials(user.fullName) : '...'}</AvatarFallback>
                            </Avatar>
                            <div className='grid w-full max-w-sm items-center gap-1.5'>
                                <Label htmlFor="picture">Profile Photo</Label>
                                <Input id="picture" type="file" />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField control={profileForm.control} name="fullName" render={({ field }) => (
                                <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={profileForm.control} name="email" render={({ field }) => (
                                <FormItem><FormLabel>Email Address</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <div className="space-y-2">
                                <Label htmlFor="role">Role</Label>
                                <Input id="role" value={user?.role} disabled className="capitalize" />
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter>
                         <Button type="submit" disabled={profileForm.formState.isSubmitting}>
                            {profileForm.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Profile
                        </Button>
                    </CardFooter>
                </Card>
            </form>
        </Form>

        <Card>
            <CardHeader>
                <CardTitle>Application Settings</CardTitle>
                <CardDescription>Customize your experience.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
                 <div className="space-y-4">
                    <Label>Language</Label>
                    <Select defaultValue="en">
                    <SelectTrigger className="max-w-sm">
                        <SelectValue placeholder="Select a language" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="ar">العربية (Arabic)</SelectItem>
                    </SelectContent>
                    </Select>
                </div>

                <div className="space-y-4">
                    <Label>Theme</Label>
                    <RadioGroup defaultValue={theme} onValueChange={setTheme} className="grid grid-cols-3 gap-4 pt-2 max-w-md">
                    <div>
                        <Label className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer">
                        <RadioGroupItem value="light" id="light" className="sr-only" />
                        <Sun className="mb-2 h-5 w-5" />
                        Light
                        </Label>
                    </div>
                    <div>
                        <Label className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer">
                        <RadioGroupItem value="dark" id="dark" className="sr-only" />
                        <Moon className="mb-2 h-5 w-5" />
                        Dark
                        </Label>
                    </div>
                    <div>
                        <Label className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer">
                        <RadioGroupItem value="system" id="system" className="sr-only" />
                        <SunMoon className="mb-2 h-5 w-5" />
                        System
                        </Label>
                    </div>
                    </RadioGroup>
                </div>
            </CardContent>
        </Card>

        <Form {...passwordForm}>
           <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}>
                <Card>
                    <CardHeader>
                        <CardTitle>Change Password</CardTitle>
                        <CardDescription>Update your login password. It is recommended to use a strong, unique password.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 max-w-sm">
                         <FormField control={passwordForm.control} name="currentPassword" render={({ field }) => (
                            <FormItem><FormLabel>Current Password</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>
                         )} />
                         <FormField control={passwordForm.control} name="newPassword" render={({ field }) => (
                            <FormItem><FormLabel>New Password</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>
                         )} />
                         <FormField control={passwordForm.control} name="confirmPassword" render={({ field }) => (
                            <FormItem><FormLabel>Confirm New Password</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>
                         )} />
                    </CardContent>
                    <CardFooter>
                         <Button type="submit" disabled={passwordForm.formState.isSubmitting}>
                            {passwordForm.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Change Password
                        </Button>
                    </CardFooter>
                </Card>
           </form>
        </Form>
      </div>
    </div>
  );
}

    