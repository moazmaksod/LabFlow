
import { NextResponse } from 'next/server';
import { getAuthenticatedUser, findOrderById, createAuditLog } from '@/lib/api/utils';
import { getOrdersCollection } from '@/lib/mongodb';
import { RecordPaymentSchema } from '@/lib/schemas/order';
import { ObjectId } from 'mongodb';

// POST /api/v1/orders/[id]/payments
// Records a payment for a specific order
export async function POST(request: Request, { params }: { params: { id: string } }) {
  const user = await getAuthenticatedUser();
  // Only receptionists and managers can record payments
  if (!user || !['receptionist', 'manager'].includes(user.role)) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  const order = await findOrderById(params.id);
  if (!order) {
    return NextResponse.json({ message: 'Order not found' }, { status: 404 });
  }

  const body = await request.json();
  const validation = RecordPaymentSchema.safeParse(body);

  if (!validation.success) {
    return NextResponse.json({ message: 'Validation failed', errors: validation.error.flatten().fieldErrors }, { status: 400 });
  }

  const { amount, method } = validation.data;

  const totalCost = order.samples.reduce((total: number, sample: any) => 
      total + sample.tests.reduce((testTotal: number, test: any) => testTotal + test.price, 0), 0);
  
  const totalPaid = (order.payments || []).reduce((sum: number, p: any) => sum + p.amount, 0);

  if (amount > totalCost - totalPaid) {
    return NextResponse.json({ message: `Payment of $${amount.toFixed(2)} exceeds the remaining balance of $${(totalCost - totalPaid).toFixed(2)}.` }, { status: 400 });
  }

  const newPayment = {
      _id: new ObjectId(),
      amount,
      method,
      date: new Date(),
      recordedBy: new ObjectId(user._id),
  };

  const newTotalPaid = totalPaid + amount;
  const newPaymentStatus = newTotalPaid >= totalCost ? 'Paid' : 'Partially Paid';

  const ordersCollection = await getOrdersCollection();
  const updateResult = await ordersCollection.updateOne(
    { orderId: params.id },
    {
      $push: { payments: newPayment },
      $set: { 
          paymentStatus: newPaymentStatus,
          updatedAt: new Date()
      },
    }
  );
  
   if (updateResult.modifiedCount === 0) {
    return NextResponse.json({ message: 'Failed to record payment.' }, { status: 500 });
  }
  
  // Create an audit log for this payment event
  await createAuditLog({
    action: 'PAYMENT_RECORDED',
    userId: user._id,
    entity: {
      collectionName: 'orders',
      documentId: order._id,
    },
    details: {
      orderId: order.orderId,
      amount: amount,
      method: method,
      newTotalPaid: newTotalPaid,
      newPaymentStatus: newPaymentStatus,
    },
  });

  return NextResponse.json({ message: 'Payment recorded successfully', newStatus: newPaymentStatus, newPayment: newPayment });
}
