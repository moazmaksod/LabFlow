
import { NextResponse } from 'next/server';
import { getAuthenticatedUser, getTests, findTestByCode, addTest } from '@/lib/api/utils';
import { TestCatalogSchema } from '@/lib/schemas/test-catalog';

// GET /api/v1/test-catalog
// Lists all tests (Manager can manage)
export async function GET(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  
   if (user.role !== 'manager') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }
  
  const tests = await getTests();
  return NextResponse.json({ data: tests });
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
    return NextResponse.json({ errors: validation.error.errors }, { status: 400 });
  }
  
  const existingTest = await findTestByCode(validation.data.testCode);
  if (existingTest) {
    return NextResponse.json({ message: `Test with code ${validation.data.testCode} already exists.`}, { status: 409 });
  }

  const newTest = await addTest(validation.data);

  return NextResponse.json({ data: newTest }, { status: 201 });
}
