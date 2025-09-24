
import { NextResponse } from 'next/server';
import { getAuthenticatedUser, getUsers, findUserByEmail, addUser } from '@/lib/api/utils';
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

  const users = await getUsers();
  return NextResponse.json({ data: users });
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
    return NextResponse.json({ errors: validation.error.errors }, { status: 400 });
  }
  
  const existingUser = await findUserByEmail(validation.data.email);
  if (existingUser) {
    return NextResponse.json({ message: `User with email ${validation.data.email} already exists.`}, { status: 409 });
  }

  const createdUser = await addUser(validation.data);

  return NextResponse.json(createdUser, { status: 201 });
}
