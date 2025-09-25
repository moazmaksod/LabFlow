
import { z } from 'zod';

export const AppointmentSchema = z.object({
  _id: z.string(), // ObjectId as string
  patientId: z.string(), // ObjectId as string
  scheduledTime: z.date(),
  durationMinutes: z.number().int().positive(),
  status: z.enum(['Scheduled', 'Arrived/Checked-in', 'Completed', 'No-show']).default('Scheduled'),
  notes: z.string().optional(),
});

export type Appointment = z.infer<typeof AppointmentSchema>;

export const CreateAppointmentSchema = AppointmentSchema.omit({ _id: true }).extend({
    scheduledTime: z.string().datetime(), // Expect ISO string from client
});
export type CreateAppointmentInput = z.infer<typeof CreateAppointmentSchema>;

export const UpdateAppointmentSchema = AppointmentSchema.omit({ _id: true, patientId: true }).partial().extend({
    scheduledTime: z.string().datetime().optional(), // Expect ISO string from client
});
export type UpdateAppointmentInput = z.infer<typeof UpdateAppointmentSchema>;
