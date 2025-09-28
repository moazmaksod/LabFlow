
import { NextResponse } from 'next/server';
import { getAuthenticatedUser, findOrderById, getOrdersCollection, createAuditLog } from '@/lib/api/utils';
import { z } from 'zod';
import { ObjectId } from 'mongodb';

const ResultEntrySchema = z.object({
  testCode: z.string(),
  value: z.any(), // Can be number or string
  notes: z.string().optional(),
});

const VerifyResultsInputSchema = z.object({
  accessionNumber: z.string(),
  results: z.array(ResultEntrySchema),
});

// This is a simplified delta check function for the prototype.
// A real-world application would have more complex, analyte-specific rules.
const performDeltaCheck = (currentValue: number, previousValue: number | undefined): boolean => {
    if (previousValue === undefined) {
        return false; // No previous result to compare against
    }
    if (typeof currentValue !== 'number' || typeof previousValue !== 'number') {
        return false; // Cannot perform delta check on non-numeric results
    }

    const difference = Math.abs(currentValue - previousValue);
    const percentChange = (difference / previousValue) * 100;

    // Example Rule: Flag if the value changes by more than 50%
    if (percentChange > 50) {
        return true; // Delta check failed
    }

    return false; // Delta check passed
};

// POST /api/v1/results/verify
// Enters and verifies a batch of test results for a given sample.
export async function POST(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user || !['technician', 'manager'].includes(user.role)) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();
  const validation = VerifyResultsInputSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json({ message: 'Validation failed', errors: validation.error.flatten().fieldErrors }, { status: 400 });
  }

  const { accessionNumber, results } = validation.data;
  const ordersCollection = await getOrdersCollection();

  // Find the order that contains the sample with the given accession number
  const order = await ordersCollection.findOne({ "samples.accessionNumber": accessionNumber });
  if (!order) {
    return NextResponse.json({ message: `Sample with accession number ${accessionNumber} not found.` }, { status: 404 });
  }

  const sampleIndex = order.samples.findIndex((s: any) => s.accessionNumber === accessionNumber);
  if (sampleIndex === -1) {
    // This should theoretically never happen if the findOne query succeeded
    return NextResponse.json({ message: 'Sample index could not be found within the order.' }, { status: 500 });
  }
  
  const sampleToUpdate = order.samples[sampleIndex];

  // In a real app, you would check the sample status precondition here.
  // For example: if (sampleToUpdate.status !== 'Testing' && sampleToUpdate.status !== 'AwaitingVerification') ...

  // Find the patient's most recent orders to perform delta checks
  const previousOrders = await ordersCollection.find({ 
      patientId: order.patientId, 
      orderStatus: 'Complete', 
      _id: { $ne: order._id } 
  }).sort({ createdAt: -1 }).limit(1).toArray();
  const previousOrder = previousOrders[0];
  
  const updatedTests = sampleToUpdate.tests.map((test: any) => {
    const resultEntry = results.find(r => r.testCode === test.testCode);
    if (!resultEntry) return test; // No result was submitted for this test

    let flags = test.flags || [];
    let isAbnormal = false;

    const newResultValue = typeof resultEntry.value === 'string' && !isNaN(parseFloat(resultEntry.value)) 
        ? parseFloat(resultEntry.value) 
        : resultEntry.value;

    // --- Delta Check Logic ---
    if (previousOrder) {
        const previousTest = previousOrder.samples.flatMap((s: any) => s.tests).find((t: any) => t.testCode === test.testCode);
        if (previousTest?.resultValue) {
             const deltaFailed = performDeltaCheck(newResultValue, previousTest.resultValue);
             if (deltaFailed) {
                 flags.push('DELTA_CHECK_FAILED');
             }
        }
    }
    
    // --- Abnormality Check ---
    if (test.referenceRange && typeof newResultValue === 'number') {
        const parts = test.referenceRange.match(/([\d.]+)\s*-\s*([\d.]+)/);
        if (parts) {
            const low = parseFloat(parts[1]);
            const high = parseFloat(parts[2]);
            if (newResultValue < low || newResultValue > high) {
                isAbnormal = true;
            }
        }
    }

    // --- Auto-Verification Logic ---
    let newStatus = test.status;
    if (flags.length === 0 && !isAbnormal) {
        // Condition for auto-verification: No flags, not abnormal.
        // In a real system, this would be for instrument results, not UI ones.
        // newStatus = 'Verified';
    } else {
        // Requires manual review
        newStatus = 'AwaitingVerification';
    }
    
    // For this endpoint, results are submitted from the UI by a technician,
    // so it's a manual verification. We override the status to 'Verified'.
    newStatus = 'Verified';
    
    return {
      ...test,
      resultValue: newResultValue,
      notes: resultEntry.notes || test.notes,
      status: newStatus,
      isAbnormal: isAbnormal,
      flags: flags,
      verifiedBy: new ObjectId(user._id),
      verifiedAt: new Date(),
    };
  });
  
  const updatedSamples = [...order.samples];
  updatedSamples[sampleIndex].tests = updatedTests;

  // Determine new sample and order status
  const allTestsInSampleVerified = updatedTests.every((t: any) => t.status === 'Verified' || t.status === 'Cancelled');
  if (allTestsInSampleVerified) {
      updatedSamples[sampleIndex].status = 'Verified';
  }
  
  const allSamplesComplete = updatedSamples.every((s: any) => s.status === 'Verified' || s.status === 'Rejected' || s.status === 'Cancelled');
  const newOrderStatus = allSamplesComplete ? 'Complete' : (order.orderStatus === 'Pending' ? 'In-Progress' : order.orderStatus);
  
  // --- Update Database ---
  await ordersCollection.updateOne(
    { _id: order._id },
    { $set: { 
        samples: updatedSamples,
        orderStatus: newOrderStatus,
        updatedAt: new Date(),
    }}
  );
  
  // --- Create Audit Log ---
  await createAuditLog({
      action: 'RESULT_VERIFIED',
      userId: user._id,
      entity: { collectionName: 'orders', documentId: order._id },
      details: {
          orderId: order.orderId,
          accessionNumber: accessionNumber,
          verifiedTestCodes: results.map(r => r.testCode)
      }
  });

  return NextResponse.json({
    message: 'Results verified successfully.',
    orderId: order.orderId,
    accessionNumber: accessionNumber,
    newStatus: allTestsInSampleVerified ? 'Verified' : updatedSamples[sampleIndex].status,
  });
}
