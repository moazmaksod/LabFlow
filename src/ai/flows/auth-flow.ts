
'use server';
/**
 * @fileOverview Authentication flows for LabFlow.
 *
 * - login - A function to handle user login.
 */
import type {AuthLoginInput} from '@/lib/schemas/auth';
import {AuthLoginInputSchema} from '@/lib/schemas/auth';
import { findUserByEmail } from '@/lib/api/utils';


/**
 * Handles user login. In a real app, this would use jsonwebtoken to sign a token.
 * For this prototype, we'll simulate it by returning a base64 encoded user object.
 * @param input - The login credentials.
 * @returns A simulated JWT token as a string, or null if login fails.
 */
export async function login(input: AuthLoginInput): Promise<string | null> {
  const validatedInput = AuthLoginInputSchema.safeParse(input);
  if (!validatedInput.success) {
    // In a real app, you'd handle this error more gracefully.
    return null;
  }

  // Use the findUserByEmail function to get the user from the database
  const user = await findUserByEmail(validatedInput.data.email);
  
  // In a real app, you'd also check the password hash here.
  if (user) {
    // Simulate JWT signing by base64 encoding the user object.
    const token = Buffer.from(JSON.stringify(user)).toString('base64');
    return token;
  }
  return null;
}
