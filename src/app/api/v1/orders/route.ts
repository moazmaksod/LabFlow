
import { NextResponse } from 'next/server';
import { getAuthenticatedUser, findPatientById, findTestByCode, addOrder } from '@/lib/api/utils';
import { CreateOrderInputSchema } from '@/lib/schemas/order';
import type { TestCatalog } from '@/lib/schemas/test-catalog';

// POST /api/v1/orders
// Creates a new test order
export async function POST(request: Request) {
    const user = await getAuthenticatedUser();
    if (!user || !['receptionist', 'manager', 'physician'].includes(user.role)) {
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const validation = CreateOrderInputSchema.safeParse(body);

    if (!validation.success) {
        return NextResponse.json({ message: 'Validation failed', errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { patientId, testCodes, ...orderData } = validation.data;

    // --- Step 2.1: Validate patient existence ---
    const patient = await findPatientById(patientId);
    if (!patient) {
        return NextResponse.json({ message: `Patient with ID ${patientId} not found.` }, { status: 404 });
    }

    // --- Step 2.2: Validate each test code ---
    const foundTests: TestCatalog[] = [];
    for (const code of testCodes) {
        const test = await findTestByCode(code);
        if (!test) {
            return NextResponse.json({ message: `Test with code "${code}" not found.` }, { status: 400 });
        }
        foundTests.push(test);
    }
    
    // Placeholder for subsequent steps
    const newOrder = {
        orderId: `ORD-TEMP-${Date.now()}`,
        patientId,
        testCodes, // This will be replaced with snapshotted tests
        ...orderData
    };

    return NextResponse.json({ data: newOrder }, { status: 201 });
}
