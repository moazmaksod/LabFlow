import { NextResponse } from 'next/server';
import { mockUsers, protectRoute } from '@/lib/api/utils';
import { UserSchema } from '@/lib/schemas/auth';

// GET /api/v1/users
// Lists all users (Manager only)
export async function GET(request: Request) {
  const user = await protectRoute(['manager']);
  if (!user) {
    // protectRoute will have already determined if this is 401 or 403
    // but for simplicity, we send 403 if no user is returned after role check.
    // A more granular approach could be taken if needed.
    const currentUser = new Headers(request.headers).get('Authorization');
     if (!currentUser) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  return NextResponse.json(mockUsers);
}

// POST /api/v1/users
// Creates a new user (Manager only)
export async function POST(request: Request) {
  const user = await protectRoute(['manager']);
  if (!user) {
    const currentUser = new Headers(request.headers).get('Authorization');
     if (!currentUser) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();
  const validation = UserSchema.omit({ id: true }).safeParse(body);

  if (!validation.success) {
    return NextResponse.json(validation.error.errors, { status: 400 });
  }
  
  if (mockUsers.some(u => u.email === validation.data.email)) {
    return NextResponse.json({ message: `User with email ${validation.data.email} already exists.`}, { status: 409 });
  }

  const newUser = {
    id: `user-${Date.now()}`,
    ...validation.data,
  };

  mockUsers.push(newUser);

  return NextResponse.json(newUser, { status: 201 });
}
