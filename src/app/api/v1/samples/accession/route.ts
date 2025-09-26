
import { NextResponse } from 'next/server';
import { getAuthenticatedUser, getOrdersCollection } from '@/lib/api/utils';
import { ObjectId } from 'mongodb';
import { z } from 'zod';

const AccessionInputSchema = z.object({
  orderId: z.string(), // This is the human-readable orderId like ORD-2025-00001
  sampleId: z.string(), // This is the mock sampleId like 'S1', we'll use it to find the sample.
});

// POST /api/v1/samples/accession
// Accessions a sample into the lab
export async function POST(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user || !['technician', 'manager'].includes(user.role)) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();
  const validation = AccessionInputSchema.safeParse(body);

  if (!validation.success) {
    return NextResponse.json({ message: 'Validation failed', errors: validation.error.flatten().fieldErrors }, { status: 400 });
  }

  const { orderId, sampleId } = validation.data;
  const ordersCollection = await getOrdersCollection();

  // In a real app with proper IDs, we might find the sample directly.
  // Here, we find the order first.
  const order = await ordersCollection.findOne({ "orderId": orderId });

  if (!order) {
    return NextResponse.json({ message: `Order with ID ${orderId} not found.` }, { status: 404 });
  }

  // Find the index and the sample itself. The `sampleId` from the frontend is a mock property.
  // We need to find the correct object in the 'samples' array.
  let sampleToUpdate;
  let sampleIndex = -1;

  for (let i = 0; i < order.samples.length; i++) {
    // This is a mock property from the frontend to identify which sample to accession.
    // In a real DB, each sample would have its own persistent unique ID.
    if ((order.samples[i] as any).sampleId === sampleId) {
        sampleToUpdate = order.samples[i];
        sampleIndex = i;
        break;
    }
  }
  
  if (!sampleToUpdate || sampleIndex === -1) {
    return NextResponse.json({ message: `Sample with identifier ${sampleId} not found in order ${orderId}` }, { status: 404 });
  }
  
  // Verify that the sample has not already been accessioned
  if (sampleToUpdate.status !== 'AwaitingCollection') {
    return NextResponse.json({ message: 'Sample has already been accessioned or processed.' }, { status: 409 });
  }
  
  // Generate a new, unique accessionNumber
  const accessionNumber = `ACC-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

  // Update the sample's status, add the accession number and timestamp
  const updateResult = await ordersCollection.updateOne(
    { _id: order._id, [`samples.${sampleIndex}.status`]: 'AwaitingCollection' }, // Ensure we're not in a race condition
    {
      $set: {
        [`samples.${sampleIndex}.status`]: 'InLab',
        [`samples.${sampleIndex}.accessionNumber`]: accessionNumber,
        [`samples.${sampleIndex}.receivedTimestamp`]: new Date(),
        'updatedAt': new Date(),
      }
    }
  );

  if (updateResult.modifiedCount === 0) {
    // This could happen if another process accessioned it between our find and update operations.
    return NextResponse.json({ message: 'Failed to update sample. It may have been recently updated.' }, { status: 409 });
  }
  
  // As per requirements, we would create an audit log entry here.
  // e.g., createAuditLog({ action: 'SAMPLE_ACCESSIONED', userId: user._id, ... });

  return NextResponse.json({
    message: 'Sample accessioned successfully.',
    accessionNumber: accessionNumber,
    newStatus: 'InLab',
  });
}
