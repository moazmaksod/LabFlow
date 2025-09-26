
import { NextResponse } from 'next/server';
import { getAuthenticatedUser, findPatientById } from '@/lib/api/utils';
import { getOrdersCollection } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// GET /api/v1/patients/[id]
// Retrieves a single patient by their database ID, and includes their order history.
export async function GET(request: Request, { params }: { params: { id: string } }) {
   const user = await getAuthenticatedUser();
   if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
   }

  // Allow any authenticated user to view patient details for now.
  // In a real app, RBAC would be stricter.

  const foundPatient = await findPatientById(params.id);
  
  if (!foundPatient) {
    return NextResponse.json({ message: 'Patient not found' }, { status: 404 });
  }

  // Fetch associated orders
  const ordersCollection = await getOrdersCollection();
  const orders = await ordersCollection.find({ patientId: new ObjectId(params.id) }).sort({ createdAt: -1 }).toArray();

  const patientWithOrders = {
    ...foundPatient,
    orders: orders,
  };

  return NextResponse.json({ data: patientWithOrders });
}

// NOTE: PUT and DELETE endpoints for a specific patient would go here.
// They are omitted for this prototype's current scope.
