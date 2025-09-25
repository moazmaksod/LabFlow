
import { NextResponse } from 'next/server';
import { getAuthenticatedUser, findPatientById, getAppointments, addAppointment } from '@/lib/api/utils';
import { CreateAppointmentSchema } from '@/lib/schemas/appointment';

// GET /api/v1/appointments
// Retrieves appointments, optionally filtered by a date range
export async function GET(request: Request) {
    const user = await getAuthenticatedUser();
    if (!user || !['receptionist', 'manager'].includes(user.role)) {
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }
    
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const query: any = {};
    if (startDate) {
        query.scheduledTime = { ...query.scheduledTime, $gte: new Date(startDate) };
    }
    if (endDate) {
        query.scheduledTime = { ...query.scheduledTime, $lt: new Date(endDate) };
    }

    const appointments = await getAppointments(query);
    return NextResponse.json({ data: appointments });
}


// POST /api/v1/appointments
// Creates a new appointment
export async function POST(request: Request) {
    const user = await getAuthenticatedUser();
    if (!user || !['receptionist', 'manager'].includes(user.role)) {
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const validation = CreateAppointmentSchema.safeParse(body);

    if (!validation.success) {
        return NextResponse.json({ message: 'Validation failed', errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { patientId, scheduledTime, ...rest } = validation.data;

    // Validate patient existence
    const patient = await findPatientById(patientId);
    if (!patient) {
        return NextResponse.json({ message: `Patient with ID ${patientId} not found.` }, { status: 404 });
    }

    const newAppointment = await addAppointment({
        patientId,
        scheduledTime: new Date(scheduledTime),
        ...rest
    });

    return NextResponse.json({ data: newAppointment }, { status: 201 });
}
