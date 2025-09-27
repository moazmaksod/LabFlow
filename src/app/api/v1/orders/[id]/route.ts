
import { NextResponse } from 'next/server';
import { getAuthenticatedUser, findOrderById } from '@/lib/api/utils';
import { ObjectId } from 'mongodb';

// GET /api/v1/orders/[id]
// Retrieves a single order by its human-readable orderId
export async function GET(request: Request, { params }: { params: { id: string } }) {
   const user = await getAuthenticatedUser();
   if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
   }

  const foundOrder = await findOrderById(params.id);
  
  if (!foundOrder) {
    return NextResponse.json({ message: 'Order not found' }, { status: 404 });
  }

  // --- Authorization Logic ---
  const isManager = user.role === 'manager';
  const isTechnician = user.role === 'technician';
  const isReceptionist = user.role === 'receptionist';

  // Allow internal lab staff to view any order
  if (isManager || isTechnician || isReceptionist) {
    return NextResponse.json({ data: foundOrder });
  }
  
  // Check for patient ownership
  if (user.role === 'patient') {
    // This assumes the patient's user ID is the same as their patient record ID.
    // In a real system, this link might be more complex.
    if (foundOrder.patientId.toString() === user._id) {
       return NextResponse.json({ data: foundOrder });
    }
  }

  // Check for physician ownership
  if (user.role === 'physician') {
    if (foundOrder.physicianId && foundOrder.physicianId.toString() === user._id) {
       return NextResponse.json({ data: foundOrder });
    }
  }

  // If none of the above conditions are met, deny access.
  return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
}
