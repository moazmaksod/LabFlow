
import { NextResponse } from 'next/server';
import { getAuthenticatedUser, findOrderById, createAuditLog } from '@/lib/api/utils';
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

  // --- Authorization & Auditing Logic ---
  const isManager = user.role === 'manager';
  const isTechnician = user.role === 'technician';
  const isReceptionist = user.role === 'receptionist';

  const logAndView = async () => {
    await createAuditLog({
        action: 'ORDER_VIEW',
        userId: user._id,
        entity: {
            collectionName: 'orders',
            documentId: foundOrder._id,
        },
        details: {
            orderId: foundOrder.orderId,
            patientMrn: foundOrder.patientDetails.mrn
        }
    });
    return NextResponse.json({ data: foundOrder });
  }

  // Allow internal lab staff to view any order
  if (isManager || isTechnician || isReceptionist) {
    return await logAndView();
  }
  
  // Check for patient ownership
  if (user.role === 'patient') {
    // A patient can see an order if they are the patient OR the guarantor.
    const isPatient = foundOrder.patientId.toString() === user._id;
    const isGuarantor = foundOrder.responsibleParty?.patientId?.toString() === user._id;
    if (isPatient || isGuarantor) {
       return await logAndView();
    }
  }

  // Check for physician ownership
  if (user.role === 'physician') {
    if (foundOrder.physicianId && foundOrder.physicianId.toString() === user._id) {
       return await logAndView();
    }
  }

  // If none of the above conditions are met, deny access.
  return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
}

    