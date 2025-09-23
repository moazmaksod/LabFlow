import { NextResponse } from 'next/server';
import { mockUsers, protectRoute } from '@/lib/api/utils';
import { User, UserSchema } from '@/lib/schemas/auth';

// GET /api/v1/users/[id]
// Retrieves a single user (Manager only)
export async function GET(request: Request, { params }: { params: { id: string } }) {
   const user = await protectRoute(['manager']);
   if (!user) {
    const currentUser = new Headers(request.headers).get('Authorization');
     if (!currentUser) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  const foundUser = mockUsers.find(u => u.id === params.id);
  if (foundUser) {
    return NextResponse.json(foundUser);
  }
  return NextResponse.json({ message: 'User not found' }, { status: 404 });
}

// PUT /api/v1/users/[id]
// Updates a user (Manager only)
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const user = await protectRoute(['manager']);
   if (!user) {
    const currentUser = new Headers(request.headers).get('Authorization');
     if (!currentUser) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  const userIndex = mockUsers.findIndex(u => u.id === params.id);
  if (userIndex === -1) {
    return NextResponse.json({ message: 'User not found' }, { status: 404 });
  }

  const body = await request.json();
  // For this prototype, we only allow role updates via this endpoint
  const validation = UserSchema.pick({ role: true }).safeParse(body);

  if (!validation.success) {
    return NextResponse.json(validation.error.errors, { status: 400 });
  }

  mockUsers[userIndex] = { ...mockUsers[userIndex], ...validation.data };

  return NextResponse.json(mockUsers[userIndex]);
}


// DELETE /api/v1/users/[id]
// Deletes a user (Manager only)
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const user = await protectRoute(['manager']);
  if (!user) {
    const currentUser = new Headers(request.headers).get('Authorization');
     if (!currentUser) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  const userIndex = mockUsers.findIndex(u => u.id === params.id);
  if (userIndex === -1) {
    return NextResponse.json({ message: 'User not found' }, { status: 404 });
  }

  mockUsers.splice(userIndex, 1);

  return NextResponse.json(null, { status: 204 }); // No Content
}
