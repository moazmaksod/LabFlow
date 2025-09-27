
import { NextResponse } from 'next/server';
import { getAuthenticatedUser, getNextSequenceValue, createAuditLog } from '@/lib/api/utils';
import { getOrdersCollection } from '@/lib/mongodb';
import { z } from 'zod';

const AccessionInputSchema = z.object({
  orderId: z.string(), // This is the human-readable orderId like ORD-2025-00001
  sampleIndex: z.number().int(), // The index of the sample in the order's samples array
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

  const { orderId, sampleIndex } = validation.data;
  const ordersCollection = await getOrdersCollection();

  const order = await ordersCollection.findOne({ "orderId": orderId });

  if (!order) {
    return NextResponse.json({ message: `Order with ID ${orderId} not found.` }, { status: 404 });
  }
  
  const sampleToUpdate = order.samples[sampleIndex];

  if (!sampleToUpdate) {
    return NextResponse.json({ message: `Sample at index ${sampleIndex} not found in order ${orderId}` }, { status: 404 });
  }
  
  // Verify that the sample has not already been accessioned
  if (sampleToUpdate.status !== 'AwaitingCollection') {
    return NextResponse.json({ message: 'Sample has already been accessioned or processed.' }, { status: 409 });
  }
  
  // Generate a new, sequential accessionNumber
  const nextId = await getNextSequenceValue('accessionNumber');
  const accessionNumber = `ACC-${new Date().getFullYear()}-${nextId.toString().padStart(5, '0')}`;

  const updatedSamples = [...order.samples];
  updatedSamples[sampleIndex] = {
    ...sampleToUpdate,
    status: 'InLab',
    accessionNumber: accessionNumber,
    receivedTimestamp: new Date(),
  };

  // Determine the new overall order status
  const allSamplesInLab = updatedSamples.every(s => s.status !== 'AwaitingCollection');
  
  let newOrderStatus = order.orderStatus;
  if (allSamplesInLab) {
    newOrderStatus = 'In-Progress'; // All samples are in lab, ready for testing
  } else {
    // If some are in lab but not all, it's partially complete
    newOrderStatus = 'Partially Complete';
  }


  // Update the sample's status, add the accession number and timestamp
  const updateResult = await ordersCollection.updateOne(
    { _id: order._id, [`samples.${sampleIndex}.status`]: 'AwaitingCollection' }, // Ensure we're not in a race condition
    {
      $set: {
        samples: updatedSamples, // Update the whole array
        orderStatus: newOrderStatus,
        updatedAt: new Date(),
      }
    }
  );

  if (updateResult.modifiedCount === 0) {
    // This could happen if another process accessioned it between our find and update operations.
    return NextResponse.json({ message: 'Failed to update sample. It may have been recently updated.' }, { status: 409 });
  }
  
  // Create an audit log for this event
  await createAuditLog({
    action: 'SAMPLE_ACCESSIONED',
    userId: user._id,
    entity: {
      collectionName: 'orders',
      documentId: order._id.toHexString(),
    },
    details: {
      orderId: order.orderId,
      sampleIndex: sampleIndex,
      newAccessionNumber: accessionNumber,
      newState: 'InLab',
      newOrderStatus: newOrderStatus,
    },
  });

  return NextResponse.json({
    message: 'Sample accessioned successfully.',
    accessionNumber: accessionNumber,
    newStatus: 'InLab',
    newOrderStatus: newOrderStatus
  });
}
