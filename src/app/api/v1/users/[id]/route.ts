
import { NextResponse } from 'next/server';
import { mockUsers, getAuthenticatedUser } from '@/lib/api/utils';
import { User, UserSchema } from '@/lib/schemas/auth';

// GET /api/v1/users/[id]
// Retrieves a single user (Manager only)
export async function GET(request: Request, { params }: { params: { id: string } }) {
   const user = await getAuthenticatedUser();
   if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
   }
   if (user.role !== 'manager') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
   }

  const foundUser = mockUsers.find(u => u.id === params.id);
  if (foundUser) {
    return NextResponse.json({ data: foundUser });
  }
  return NextResponse.json({ message: 'User not found' }, { status: 404 });
}

// PUT /api/v1/users/[id]
// Updates a user (Manager only)
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const user = await getAuthenticatedUser();
  if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  if (user.role !== 'manager') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  const userIndex = mockUsers.findIndex(u => u.id === params.id);
  if (userIndex === -1) {
    return NextResponse.json({ message: 'User not found' }, { status: 404 });
  }

  const body = await request.json();
  // We only allow updating a small subset of fields, like 'role'.
  const validation = UserSchema.pick({ role: true }).partial().safeParse(body);

  if (!validation.success) {
    return NextResponse.json({ errors: validation.error.errors }, { status: 400 });
  }
  
  const updatedUser = { ...mockUsers[userIndex], ...validation.data };
  mockUsers[userIndex] = updatedUser;

  return NextResponse.json({ data: updatedUser });
}


// DELETE /api/v1/users/[id]
// Deletes a user (Manager only)
export async function DELETE(request: Request, { params }: { params: { id: string } })
{
  const user = await getAuthenticatedUser();
  if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  if (user.role !== 'manager') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  const userIndex = mockUsers.findIndex(u => u.id === params.id);
  if (userIndex === -1) {
    return NextResponse.json({ message: 'User not found' }, { status: 404 });
  }

  mockUsers.splice(userIndex, 1);

  return new NextResponse(null, { status: 204 }); // No Content
}
