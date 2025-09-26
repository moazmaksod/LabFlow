
import { NextResponse } from 'next/server';
import { getAuthenticatedUser, getOrdersCollection } from '@/lib/api/utils';
import { ObjectId } from 'mongodb';
import { z } from 'zod';

const AccessionInputSchema = z.object({
  orderId: z.string(), // This is the human-readable orderId like ORD-2025-00001
  sampleId: z.string(), // This is the mock sampleId like 'S1', we'll use it to find the index
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

  const order = await ordersCollection.findOne({ orderId: orderId });

  if (!order) {
    return NextResponse.json({ message: 'Order not found' }, { status: 404 });
  }

  // Find the index of the sample to update. In a real app, samples would have unique IDs.
  // For the prototype, we find it by its mock ID 'S1', 'S2', etc.
  const sampleIndex = order.samples.findIndex((s: any) => s.sampleId === sampleId);
  
  if (sampleIndex === -1) {
    return NextResponse.json({ message: 'Sample not found in order' }, { status: 404 });
  }
  
  const sampleToUpdate = order.samples[sampleIndex];

  if (sampleToUpdate.status !== 'AwaitingCollection') {
    return NextResponse.json({ message: 'Sample has already been accessioned or processed.' }, { status: 409 });
  }
  
  // Generate a unique accession number
  // In a real system, this might come from a dedicated sequence generator.
  const accessionNumber = `ACC-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

  const updateResult = await ordersCollection.updateOne(
    { _id: order._id, "samples.sampleId": sampleId },
    {
      $set: {
        [`samples.${sampleIndex}.status`]: 'InLab',
        [`samples.${sampleIndex}.accessionNumber`]: accessionNumber,
        [`samples.${sampleİndex}.receivedTimestamp`]: new Date(),
        'updatedAt': new Date(),
      }
    }
  );

  if (updateResult.modifiedCount === 0) {
    return NextResponse.json({ message: 'Failed to update sample status.' }, { status: 500 });
  }
  
  // In a real system, we'd also log this to an audit trail collection here.

  return NextResponse.json({
    message: 'Sample accessioned successfully.',
    accessionNumber: accessionNumber,
    newStatus: 'InLab',
  });
}
