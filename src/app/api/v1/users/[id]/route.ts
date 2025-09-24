
import { NextResponse } from 'next/server';
import { getAuthenticatedUser, findUserById, findUserIndexById, updateUser, removeUser } from '@/lib/api/utils';
import { UserSchema } from '@/lib/schemas/auth';

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

  const foundUser = findUserById(params.id);
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

  const userIndex = findUserIndexById(params.id);
  if (userIndex === -1) {
    return NextResponse.json({ message: 'User not found' }, { status: 404 });
  }

  const body = await request.json();

  // We only allow updating a small subset of fields, like 'role'.
  const validation = UserSchema.pick({ role: true }).safeParse(body);

  if (!validation.success) {
    return NextResponse.json({ message: "Validation failed", errors: validation.error.errors }, { status: 400 });
  }
  
  const existingUser = findUserById(params.id)!;
  const updatedUser = { ...existingUser, ...validation.data };
  updateUser(userIndex, updatedUser);

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

  const userIndex = findUserIndexById(params.id);
  if (userIndex === -1) {
    return NextResponse.json({ message: 'User not found' }, { status: 404 });
  }

  removeUser(userIndex);

  return new NextResponse(null, { status: 204 }); // No Content
}
