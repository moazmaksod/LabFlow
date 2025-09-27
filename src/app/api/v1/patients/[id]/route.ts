
import { NextResponse } from 'next/server';
import { getAuthenticatedUser, findPatientById } from '@/lib/api/utils';

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
  
  // Attach guarantor details to each order for easier frontend display
  if (foundPatient.orders) {
    for (const order of foundPatient.orders) {
        if (order.responsibleParty?.patientId) {
            const guarantor = await findPatientById(order.responsibleParty.patientId.toString());
            if (guarantor) {
                (order as any).guarantorDetails = {
                    _id: guarantor._id,
                    fullName: guarantor.fullName,
                    mrn: guarantor.mrn
                };
            }
        }
    }
  }


  return NextResponse.json({ data: foundPatient });
}

// NOTE: PUT and DELETE endpoints for a specific patient would go here.
// They are omitted for this prototype's current scope.
