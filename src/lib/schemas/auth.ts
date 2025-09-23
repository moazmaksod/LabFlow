
import {z} from 'zod';

export const AuthLoginInputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password is required'),
});
export type AuthLoginInput = z.infer<typeof AuthLoginInputSchema>;

export const UserSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  role: z.enum(['receptionist', 'technician', 'manager', 'physician', 'patient']),
});
export type User = z.infer<typeof UserSchema>;
