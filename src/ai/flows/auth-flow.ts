
'use server';
/**
 * @fileOverview Authentication flows for LabFlow.
 *
 * - login - A function to handle user login.
 */

import {z} from 'zod';
import type { AuthLoginInput, User } from '@/lib/schemas/auth';


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
