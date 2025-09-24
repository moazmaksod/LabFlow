
import { NextResponse } from 'next/server';
import { getAuthenticatedUser, findUserById, updateUser, removeUser } from '@/lib/api/utils';
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

  const foundUser = await findUserById(params.id);
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

  const existingUser = await findUserById(params.id);
  if (!existingUser) {
    return NextResponse.json({ message: 'User not found' }, { status: 404 });
  }

  const body = await request.json();

  // We only allow updating a small subset of fields, like 'role'.
  const validation = UserSchema.pick({ role: true }).safeParse(body);

  if (!validation.success) {
    return NextResponse.json({ message: "Validation failed", errors: validation.error.errors }, { status: 400 });
  }
  
  await updateUser(params.id, validation.data);
  const updatedUser = { ...existingUser, ...validation.data };

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

  const success = await removeUser(params.id);
  if (!success) {
    return NextResponse.json({ message: 'User not found' }, { status: 404 });
  }

  return new NextResponse(null, { status: 204 }); // No Content
}
