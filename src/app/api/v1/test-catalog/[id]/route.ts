
import { NextResponse } from 'next/server';
import { mockTests, protectRoute } from '@/lib/api/utils';
import { TestCatalogSchema } from '@/lib/schemas/test-catalog';

// GET /api/v1/test-catalog/[id]
// Retrieves a single test (Manager only)
export async function GET(request: Request, { params }: { params: { id: string } }) {
   const user = await protectRoute(['manager']);
   if (!user) {
    const currentUser = new Headers(request.headers).get('Authorization');
     if (!currentUser) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  const foundTest = mockTests.find(t => t._id === params.id);
  if (foundTest) {
    return NextResponse.json(foundTest);
  }
  return NextResponse.json({ message: 'Test not found' }, { status: 404 });
}

// PUT /api/v1/test-catalog/[id]
// Updates a test (Manager only)
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const user = await protectRoute(['manager']);
   if (!user) {
    const currentUser = new Headers(request.headers).get('Authorization');
     if (!currentUser) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  const testIndex = mockTests.findIndex(t => t._id === params.id);
  if (testIndex === -1) {
    return NextResponse.json({ message: 'Test not found' }, { status: 404 });
  }

  const body = await request.json();
  const validation = TestCatalogSchema.omit({ _id: true }).safeParse(body);

  if (!validation.success) {
    return NextResponse.json(validation.error.errors, { status: 400 });
  }

  mockTests[testIndex] = { ...mockTests[testIndex], ...validation.data };

  return NextResponse.json(mockTests[testIndex]);
}


// DELETE /api/v1/test-catalog/[id]
// Deletes a test (Manager only)
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const user = await protectRoute(['manager']);
  if (!user) {
    const currentUser = new Headers(request.headers).get('Authorization');
     if (!currentUser) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  const testIndex = mockTests.findIndex(t => t._id === params.id);
  if (testIndex === -1) {
    return NextResponse.json({ message: 'Test not found' }, { status: 404 });
  }

  mockTests.splice(testIndex, 1);

  return NextResponse.json(null, { status: 204 }); // No Content
}
