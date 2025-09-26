
import { NextResponse } from 'next/server';
import { getAuthenticatedUser, updateUser } from '@/lib/api/utils';
import { UpdateProfileFormSchema } from '@/lib/schemas/user';
import { User, UserSchema } from '@/lib/schemas/auth';
import { Buffer } from 'buffer';

// PUT /api/v1/users/me
// Updates the currently authenticated user's profile
export async function PUT(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const validation = UpdateProfileFormSchema.safeParse(body);

  if (!validation.success) {
    return NextResponse.json({ message: 'Validation failed', errors: validation.error.flatten().fieldErrors }, { status: 400 });
  }

  const updates = validation.data;
  const success = await updateUser(user._id, updates);

  if (!success) {
    return NextResponse.json({ message: 'Failed to update user' }, { status: 500 });
  }
  
  // If update is successful, issue a new token with the updated info
  const updatedUser: User = {
      ...user,
      ...updates
  };
  const updatedToken = Buffer.from(JSON.stringify(updatedUser)).toString('base64');


  return NextResponse.json({ message: 'Profile updated successfully', updatedToken });
}

    