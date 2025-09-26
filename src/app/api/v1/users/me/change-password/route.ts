
import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/api/utils';
import { UpdatePasswordFormSchema } from '@/lib/schemas/user';

// PUT /api/v1/users/me/change-password
// Changes the currently authenticated user's password
export async function PUT(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const validation = UpdatePasswordFormSchema.safeParse(body);

  if (!validation.success) {
    return NextResponse.json({ message: 'Validation failed', errors: validation.error.flatten().fieldErrors }, { status: 400 });
  }
  
  const { currentPassword, newPassword } = validation.data;

  // --- Password verification logic ---
  // In a real app, you would:
  // 1. Fetch the user's hashed password from the database.
  // 2. Use a library like `bcrypt` to compare the `currentPassword` with the stored hash.
  // 3. If it matches, hash the `newPassword` and save it to the database.
  
  // For this prototype, we will simulate a simple check.
  // We'll assume the user's password is 'password123' for demonstration purposes.
  if (currentPassword !== 'password123') {
    return NextResponse.json({ message: 'Incorrect current password.' }, { status: 400 });
  }
  
  console.log(`Simulating: User ${user.email} changed their password to "${newPassword}"`);

  return NextResponse.json({ message: 'Password updated successfully' });
}

    