
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
import { Moon, Sun, SunMoon } from 'lucide-react';
import { useTheme } from "next-themes"

export default function ProfilePage() {
  const userAvatar = PlaceHolderImages.find(
    (img) => img.id === 'user-avatar-1'
  );
   const { theme, setTheme } = useTheme()

  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-headline text-3xl font-semibold">
        Profile & Settings
      </h1>

      <div className="grid gap-8">
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
                                width={80}
                                height={80}
                                data-ai-hint={userAvatar.imageHint}
                            />
                            )}
                        <AvatarFallback>JD</AvatarFallback>
                    </Avatar>
                    <div className='grid w-full max-w-sm items-center gap-1.5'>
                         <Label htmlFor="picture">Profile Photo</Label>
                        <Input id="picture" type="file" />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input id="name" defaultValue="Dr. Jane Doe" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input id="email" type="email" defaultValue="jane.doe@labflow.med" />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input id="phone" type="tel" defaultValue="+966 50 123 4567" />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="dob">Date of Birth</Label>
                        <Input id="dob" type="date" defaultValue="1980-01-01" />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="role">Role</Label>
                        <Input id="role" defaultValue="Administrator" disabled />
                    </div>
                </div>

            </CardContent>
            <CardFooter>
                <Button>Save Profile</Button>
            </CardFooter>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Application Settings</CardTitle>
                <CardDescription>Customize your experience.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
                 <div className="space-y-4">
                    <Label>Language</Label>
                    <Select defaultValue="en">
                    <SelectTrigger>
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
                    <RadioGroup defaultValue={theme} onValueChange={setTheme} className="grid grid-cols-3 gap-4 pt-2">
                    <div>
                        <Label className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                        <RadioGroupItem value="light" id="light" className="sr-only" />
                        <Sun className="mb-2 h-5 w-5" />
                        Light
                        </Label>
                    </div>
                    <div>
                        <Label className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                        <RadioGroupItem value="dark" id="dark" className="sr-only" />
                        <Moon className="mb-2 h-5 w-5" />
                        Dark
                        </Label>
                    </div>
                    <div>
                        <Label className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                        <RadioGroupItem value="system" id="system" className="sr-only" />
                        <SunMoon className="mb-2 h-5 w-5" />
                        System
                        </Label>
                    </div>
                    </RadioGroup>
                </div>
            </CardContent>
             <CardFooter>
                <Button>Save Preferences</Button>
            </CardFooter>
        </Card>

         <Card>
            <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>Update your login password. It is recommended to use a strong, unique password.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input id="current-password" type="password" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input id="new-password" type="password" />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <Input id="confirm-password" type="password" />
                </div>
            </CardContent>
            <CardFooter>
                <Button>Change Password</Button>
            </CardFooter>
        </Card>
      </div>
    </div>
  );
}
