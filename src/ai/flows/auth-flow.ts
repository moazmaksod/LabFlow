'use server';
/**
 * @fileOverview Authentication flows for LabFlow.
 *
 * - login - A function to handle user login.
 * - AuthLoginInput - The Zod schema for login input.
 * - User - The Zod schema for a user.
 */

import {ai} from '@/ai/genkit';
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

const mockUsers: User[] = [
    { id: '1', firstName: 'Jane', lastName: 'Doe', email: 'jane.doe@labflow.med', role: 'manager' },
    { id: '2', firstName: 'Sam', lastName: 'Wilson', email: 'sam.wilson@labflow.med', role: 'receptionist' },
    { id: '3', firstName: 'Bruce', lastName: 'Banner', email: 'bruce.banner@labflow.med', role: 'technician' },
    { id: '4', firstName: 'Dr. Stephen', lastName: 'Strange', email: 'dr.strange@clinic.com', role: 'physician' },
];

export async function login(input: AuthLoginInput): Promise<User | null> {
  const user = mockUsers.find(u => u.email === input.email);
  // In a real app, you'd also check the password hash.
  if (user) {
    return user;
  }
  return null;
}

ai.defineFlow(
  {
    name: 'loginFlow',
    inputSchema: AuthLoginInputSchema,
    outputSchema: UserSchema.nullable(),
  },
  login
);
