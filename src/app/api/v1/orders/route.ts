
import { NextResponse } from 'next/server';
import { getAuthenticatedUser, findPatientById, getTests, addOrder } from '@/lib/api/utils';
import { CreateOrderInputSchema } from '@/lib/schemas/order';
import { TestCatalog } from '@/lib/schemas/test-catalog';

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

    // Validate patient exists
    const patient = await findPatientById(patientId);
    if (!patient) {
        return NextResponse.json({ message: `Patient with ID ${patientId} not found.` }, { status: 404 });
    }
    
    // Fetch all test details from the catalog to prepare for snapshotting
    const testsFromCatalog = await getTests({ testCode: { $in: testCodes } });
    if (testsFromCatalog.length !== testCodes.length) {
        return NextResponse.json({ message: 'One or more invalid test codes provided.' }, { status: 400 });
    }

    // Group tests by sample type to create sample objects
    const samplesByTubeType = testsFromCatalog.reduce((acc, test) => {
        const tubeType = test.specimenRequirements.tubeType;
        if (!acc[tubeType]) {
            acc[tubeType] = [];
        }
        acc[tubeType].push(test);
        return acc;
    }, {} as Record<string, TestCatalog[]>);

    // Create the samples array with snapshotted test data
    const samples = Object.entries(samplesByTubeType).map(([tubeType, tests]) => {
        return {
            sampleType: tubeType, // The backend spec calls for this field, but it's not well-defined. Using tubeType as a proxy.
            tests: tests.map(test => ({
                testCode: test.testCode,
                name: test.name,
                status: 'Pending',
                // Snapshot the first reference range as a string for this prototype
                referenceRange: test.referenceRanges?.[0] 
                    ? `${test.referenceRanges[0].rangeLow}-${test.referenceRanges[0].rangeHigh} ${test.referenceRanges[0].units}` 
                    : 'N/A',
                resultUnits: test.referenceRanges?.[0]?.units || '',
            })),
        };
    });

    const newOrderPayload = {
        patientId: patientId,
        ...orderData,
        samples: samples,
        createdBy: user._id,
    };
    
    const newOrder = await addOrder(newOrderPayload as any);

    return NextResponse.json({ data: newOrder }, { status: 201 });
}
