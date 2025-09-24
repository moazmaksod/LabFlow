
import {z} from 'zod';

export const AuthLoginInputSchema = z.object({
  email: z.string().email(),
  // Password can be anything in the prototype, so we just check for string.
  password: z.string(),
});
export type AuthLoginInput = z.infer<typeof AuthLoginInputSchema>;

export const UserSchema = z.object({
  _id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  role: z.enum(['receptionist', 'technician', 'manager', 'physician', 'patient']),
});
export type User = z.infer<typeof UserSchema>;
