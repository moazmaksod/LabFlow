
import { NextResponse } from 'next/server';
import { getAuthenticatedUser, findPatientById, findTestByCode, addOrder } from '@/lib/api/utils';
import { CreateOrderInputSchema } from '@/lib/schemas/order';
import type { SnapshottedTest } from '@/lib/schemas/order';

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

    // Placeholder for the full order creation logic.
    // In subsequent steps, we will add test snapshotting and database insertion here.
    
    const newOrder = {
        orderId: `ORD-TEMP-${Date.now()}`,
        patientId,
        testCodes,
        ...orderData
    };

    return NextResponse.json({ data: newOrder }, { status: 201 });
}
