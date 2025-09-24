
import { NextResponse } from 'next/server';
import { getAuthenticatedUser, findTestById, updateTest, removeTest } from '@/lib/api/utils';
import { TestCatalogSchema } from '@/lib/schemas/test-catalog';

// GET /api/v1/test-catalog/[id]
// Retrieves a single test (Manager only)
export async function GET(request: Request, { params }: { params: { id: string } }) {
   const user = await getAuthenticatedUser();
   if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
   }
   if (user.role !== 'manager') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
   }

  const foundTest = await findTestById(params.id);
  if (foundTest) {
    return NextResponse.json({ data: foundTest });
  }
  return NextResponse.json({ message: 'Test not found' }, { status: 404 });
}

// PUT /api/v1/test-catalog/[id]
// Updates a test (Manager only)
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const user = await getAuthenticatedUser();
  if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  if (user.role !== 'manager') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  const existingTest = await findTestById(params.id);
  if (!existingTest) {
    return NextResponse.json({ message: 'Test not found' }, { status: 404 });
  }

  const body = await request.json();
  const validation = TestCatalogSchema.omit({ _id: true }).partial().safeParse(body);

  if (!validation.success) {
    return NextResponse.json({ errors: validation.error.errors }, { status: 400 });
  }

  await updateTest(params.id, validation.data);
  const updatedTest = { ...existingTest, ...validation.data };

  return NextResponse.json({ data: updatedTest });
}


// DELETE /api/v1/test-catalog/[id]
// Deletes a test (Manager only)
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const user = await getAuthenticatedUser();
  if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  if (user.role !== 'manager') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  const success = await removeTest(params.id);
  if (!success) {
    return NextResponse.json({ message: 'Test not found' }, { status: 404 });
  }

  return new NextResponse(null, { status: 204 }); // No Content
}
