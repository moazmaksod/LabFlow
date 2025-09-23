
import { NextResponse } from 'next/server';
import { mockTests, getAuthenticatedUser } from '@/lib/api/utils';
import { TestCatalogSchema } from '@/lib/schemas/test-catalog';

// GET /api/v1/test-catalog
// Lists all tests (Manager only for management purposes)
export async function GET(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  if (user.role !== 'manager') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  return NextResponse.json(mockTests);
}

// POST /api/v1/test-catalog
// Creates a new test (Manager only)
export async function POST(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  if (user.role !== 'manager') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();
  const validation = TestCatalogSchema.omit({ _id: true }).safeParse(body);

  if (!validation.success) {
    return NextResponse.json(validation.error.errors, { status: 400 });
  }
  
  if (mockTests.some(t => t.testCode === validation.data.testCode)) {
    return NextResponse.json({ message: `Test with code ${validation.data.testCode} already exists.`}, { status: 409 });
  }

  const newTest: TestCatalog = {
    _id: `test-${Date.now()}`,
    ...validation.data,
  };

  mockTests.push(newTest);

  return NextResponse.json(newTest, { status: 201 });
}
