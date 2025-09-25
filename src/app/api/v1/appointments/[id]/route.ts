
import { NextResponse } from 'next/server';
import { getAuthenticatedUser, findAppointmentById, updateAppointment, removeAppointment } from '@/lib/api/utils';
import { UpdateAppointmentSchema } from '@/lib/schemas/appointment';

// GET /api/v1/appointments/[id]
// Retrieves a single appointment
export async function GET(request: Request, { params }: { params: { id: string } }) {
   const user = await getAuthenticatedUser();
   if (!user || !['receptionist', 'manager'].includes(user.role)) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
   }

  const appointment = await findAppointmentById(params.id);
  if (appointment) {
    return NextResponse.json({ data: appointment });
  }
  return NextResponse.json({ message: 'Appointment not found' }, { status: 404 });
}

// PUT /api/v1/appointments/[id]
// Updates an appointment
export async function PUT(request: Request, { params }: { params: { id: string } }) {  
  const user = await getAuthenticatedUser();
  if (!user || !['receptionist', 'manager'].includes(user.role)) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  const existingAppointment = await findAppointmentById(params.id);
  if (!existingAppointment) {
    return NextResponse.json({ message: 'Appointment not found' }, { status: 404 });
  }

  const body = await request.json();
  const validation = UpdateAppointmentSchema.safeParse(body);

  if (!validation.success) {
    return NextResponse.json({ message: "Validation failed", errors: validation.error.flatten().fieldErrors }, { status: 400 });
  }
  
  const { scheduledTime, ...rest } = validation.data;
  const updatePayload: any = { ...rest };
  if (scheduledTime) {
      updatePayload.scheduledTime = new Date(scheduledTime);
  }

  await updateAppointment(params.id, updatePayload);
  const updatedAppointment = { ...existingAppointment, ...updatePayload };

  return NextResponse.json({ data: updatedAppointment });
}


// DELETE /api/v1/appointments/[id]
// Deletes an appointment
export async function DELETE(request: Request, { params }: { params: { id: string } })
{
  const user = await getAuthenticatedUser();
  if (!user || !['receptionist', 'manager'].includes(user.role)) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  const success = await removeAppointment(params.id);
  if (!success) {
    return NextResponse.json({ message: 'Appointment not found' }, { status: 404 });
  }

  return new NextResponse(null, { status: 204 }); // No Content
}
