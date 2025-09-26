
import { NextResponse } from 'next/server';
import { getAuthenticatedUser, getPatients, findPatientByMrn, addPatient, createAuditLog } from '@/lib/api/utils';
import { PatientFormSchema } from '@/lib/schemas/patient';
import { z } from 'zod';
import { ObjectId } from 'mongodb';

// GET /api/v1/patients
// Lists all patients, or searches if query params are provided
export async function GET(request: Request) {
  const user = await getAuthenticatedUser();
  // Allow technicians to search for patients as well.
  if (!user || !['receptionist', 'technician', 'manager'].includes(user.role)) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const searchTerm = searchParams.get('search');

  let query = {};
  if (searchTerm) {
    const searchRegex = new RegExp(searchTerm, 'i');
    query = {
      $or: [
        { mrn: searchRegex },
        { fullName: searchRegex },
      ],
    };
  }

  const patients = await getPatients(query);
  return NextResponse.json({ data: patients });
}

// POST /api/v1/patients
// Creates a new patient (Receptionist or Manager only)
export async function POST(request: Request) {
  const user = await getAuthenticatedUser();
   if (!user || !['receptionist', 'manager'].includes(user.role)) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();
  
  const validation = PatientFormSchema.safeParse(body);

  if (!validation.success) {
    return NextResponse.json({ message: 'Validation failed', errors: validation.error.flatten().fieldErrors }, { status: 400 });
  }
  
  const existingPatient = await findPatientByMrn(validation.data.mrn);
  if (existingPatient) {
    return NextResponse.json({ message: `Patient with MRN ${validation.data.mrn} already exists.`}, { status: 409 });
  }

  const { dateOfBirth, ...rest } = validation.data;
  const dobDate = new Date(dateOfBirth.year, dateOfBirth.month - 1, dateOfBirth.day);

  const patientToCreate: any = {
      ...rest,
      dateOfBirth: dobDate,
      createdBy: new ObjectId(user._id),
      createdAt: new Date(),
      updatedAt: new Date()
  };

  const newPatient = await addPatient(patientToCreate);
  
  // Create an audit log for this event
  await createAuditLog({
    action: 'PATIENT_CREATE',
    userId: user._id,
    entity: {
      collectionName: 'patients',
      documentId: newPatient._id,
    },
    details: {
      mrn: newPatient.mrn,
      fullName: newPatient.fullName,
    },
  });

  return NextResponse.json({ data: newPatient }, { status: 201 });
}
