
import { NextResponse } from 'next/server';
import { getAuthenticatedUser, getPatients, findPatientByMrn, addPatient } from '@/lib/api/utils';
import { PatientFormSchema } from '@/lib/schemas/patient';
import { z } from 'zod';

// GET /api/v1/patients
// Lists all patients, or searches if query params are provided
export async function GET(request: Request) {
  const user = await getAuthenticatedUser();
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
        { firstName: searchRegex },
        { lastName: searchRegex },
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
  
  // Zod can't parse date from JSON automatically, so we preprocess it
  if(body.dateOfBirth) {
    body.dateOfBirth = new Date(body.dateOfBirth);
  }
  
  const validation = PatientFormSchema.safeParse(body);

  if (!validation.success) {
    return NextResponse.json({ message: 'Validation failed', errors: validation.error.flatten().fieldErrors }, { status: 400 });
  }
  
  const existingPatient = await findPatientByMrn(validation.data.mrn);
  if (existingPatient) {
    return NextResponse.json({ message: `Patient with MRN ${validation.data.mrn} already exists.`}, { status: 409 });
  }

  const patientWithTimestamps = {
      ...validation.data,
      createdAt: new Date(),
      updatedAt: new Date()
  };

  const newPatient = await addPatient(patientWithTimestamps);

  return NextResponse.json({ data: newPatient }, { status: 201 });
}

    