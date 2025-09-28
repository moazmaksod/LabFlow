
import { NextResponse } from 'next/server';
import { getAuthenticatedUser, findPatientById, createAuditLog } from '@/lib/api/utils';

// GET /api/v1/patients/[id]
// Retrieves a single patient by their database ID, and includes their order history.
export async function GET(request: Request, { params }: { params: { id: string } }) {
   const user = await getAuthenticatedUser();
   if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
   }

   const logAndView = async (patientData: any) => {
        await createAuditLog({
            action: 'PATIENT_VIEW',
            userId: user._id,
            entity: {
                collectionName: 'patients',
                documentId: patientData._id,
            },
            details: {
                patientMrn: patientData.mrn,
                patientName: patientData.fullName
            }
        });
        return NextResponse.json({ data: patientData });
   }

  // --- Authorization Logic ---
  // Managers and Receptionists can view full details of any patient.
  if (user.role === 'manager' || user.role === 'receptionist') {
    const fullPatientData = await findPatientById(params.id, { includeOrders: true });
    if (!fullPatientData) {
      return NextResponse.json({ message: 'Patient not found' }, { status: 404 });
    }
    return await logAndView(fullPatientData);
  }

  // Technicians can view limited, non-sensitive patient data.
  if (user.role === 'technician') {
    const limitedPatientData = await findPatientById(params.id, { includeOrders: true, isLimitedView: true });
     if (!limitedPatientData) {
      return NextResponse.json({ message: 'Patient not found' }, { status: 404 });
    }
    return await logAndView(limitedPatientData);
  }

  // Other roles can only view a patient if they are that patient.
  if (user._id === params.id) {
    const selfPatientData = await findPatientById(params.id, { includeOrders: true });
     if (!selfPatientData) {
      return NextResponse.json({ message: 'Patient not found' }, { status: 404 });
    }
    return await logAndView(selfPatientData);
  }

  // For any other role trying to access a patient that is not themselves, forbid it.
  return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
}

// NOTE: PUT and DELETE endpoints for a specific patient would go here.
// They are omitted for this prototype's current scope.
