
import { NextResponse } from 'next/server';
import { mockUsers, getAuthenticatedUser } from '@/lib/api/utils';
import { UserSchema } from '@/lib/schemas/auth';

// GET /api/v1/users
// Lists all users (Manager only)
export async function GET(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  if (user.role !== 'manager') {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  // Return data in a structured object
  return NextResponse.json({ data: mockUsers });
}

// POST /api/v1/users
// Creates a new user (Manager only)
export async function POST(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  if (user.role !== 'manager') {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();
  const validation = UserSchema.omit({ _id: true }).safeParse(body);

  if (!validation.success) {
    return NextResponse.json(validation.error.errors, { status: 400 });
  }
  
  if (mockUsers.some(u => u.email === validation.data.email)) {
    return NextResponse.json({ message: `User with email ${validation.data.email} already exists.`}, { status: 409 });
  }

  const newUser = {
    _id: `user-${Date.now()}`,
    ...validation.data,
  };

  mockUsers.push(newUser);

  return NextResponse.json(newUser, { status: 201 });
}

    