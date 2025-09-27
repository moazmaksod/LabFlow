
import { NextResponse } from 'next/server';
import { getAuthenticatedUser, findPatientById, findTestByCode, addOrder, getOrders, createAuditLog } from '@/lib/api/utils';
import { CreateOrderInputSchema } from '@/lib/schemas/order';
import type { TestCatalog } from '@/lib/schemas/test-catalog';
import { ObjectId } from 'mongodb';

// GET /api/v1/orders
// Retrieves all orders
export async function GET(request: Request) {
    const user = await getAuthenticatedUser();
    if (!user) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get('status');

    // Base query
    let query: any = {};

    // Filter by status if provided. Can be a comma-separated list.
    if (statusParam) {
        const statuses = statusParam.split(',').map(s => s.trim());
        if (statuses.length > 1) {
            query.orderStatus = { $in: statuses };
        } else {
            query.orderStatus = statuses[0];
        }
    }

    // Filter orders based on user role
    if (user.role === 'receptionist') {
        // Receptionists can only see orders they created
        query.createdBy = new ObjectId(user._id);
    } else if (user.role === 'physician') {
        // Physicians can only see orders they are assigned to
        query.physicianId = new ObjectId(user._id);
    } else if (user.role === 'patient') {
        // Patients can only see orders linked to their patient ID.
        // This requires a separate lookup not implemented here for simplicity.
        return NextResponse.json({ data: [] });
    }
    // Managers and Technicians can see all orders based on the status filter

    const orders = await getOrders(query);
    return NextResponse.json({ data: orders });
}


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

    // --- Validate patient existence ---
    const patient = await findPatientById(patientId);
    if (!patient) {
        return NextResponse.json({ message: `Patient with ID ${patientId} not found.` }, { status: 404 });
    }

    // --- Validate each test code ---
    const foundTests: TestCatalog[] = [];
    for (const code of testCodes) {
        const test = await findTestByCode(code);
        if (!test) {
            return NextResponse.json({ message: `Test with code "${code}" not found.` }, { status: 400 });
        }
        foundTests.push(test);
    }
    
    // --- Perform the "snapshotting" process ---

    // Group tests by required sample type to model real-world samples
    const samplesByTubeType = foundTests.reduce((acc, test) => {
        const tubeType = test.specimenRequirements.tubeType;
        if (!acc[tubeType]) {
            acc[tubeType] = [];
        }
        acc[tubeType].push(test);
        return acc;
    }, {} as Record<string, TestCatalog[]>);

    const orderSamples = Object.entries(samplesByTubeType).map(([tubeType, tests]) => {
        return {
            sampleType: tubeType, // e.g., "Lavender Top"
            status: 'AwaitingCollection',
            tests: tests.map(test => {
                // Find the first reference range to use for the snapshot.
                // A real app might have more complex logic based on patient demographics.
                const range = test.referenceRanges?.[0];
                const formattedRange = range ? `${range.rangeLow} - ${range.rangeHigh} ${range.units}` : 'N/A';

                return {
                    testCode: test.testCode,
                    name: test.name,
                    price: test.price, // Snapshot the price at time of order
                    status: 'Pending',
                    resultUnits: range?.units || test.specimenRequirements.units,
                    referenceRange: formattedRange,
                };
            })
        };
    });
    
    // --- Generate ID and Save Order ---
    const orderToCreate: any = {
        patientId,
        ...orderData,
        samples: orderSamples,
        orderStatus: 'Pending',
        paymentStatus: orderData.billingType === 'Self-Pay' ? 'Unpaid' : 'Waived', // Waived for insurance, Unpaid for self-pay
        createdBy: user._id,
        payments: [],
    };

    // Convert responsibleParty patientId to ObjectId if it exists
    if (orderToCreate.responsibleParty?.patientId) {
        orderToCreate.responsibleParty.patientId = new ObjectId(orderToCreate.responsibleParty.patientId);
    }
    
    const newOrder = await addOrder(orderToCreate);
    
    // --- Create an audit log for the order creation event ---
    await createAuditLog({
        action: 'ORDER_CREATE',
        userId: user._id,
        entity: {
            collectionName: 'orders',
            documentId: newOrder._id,
        },
        details: {
            orderId: newOrder.orderId,
            patientId: newOrder.patientId.toString(),
            testCount: newOrder.samples.reduce((acc: number, s: any) => acc + s.tests.length, 0),
        },
    });


    return NextResponse.json({ data: newOrder }, { status: 201 });
}

    