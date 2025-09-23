
'use server';

import { User, UserSchema } from '@/lib/schemas/auth';
import { TestCatalog } from '@/lib/schemas/test-catalog';
import { headers } from 'next/headers';

/**
 * In a real app, this would involve a database lookup.
 * For the prototype, we use a mock array.
 */
export const mockUsers: User[] = [
  {
    id: '1',
    firstName: 'Jane',
    lastName: 'Doe',
    email: 'jane.doe@labflow.med',
    role: 'manager',
  },
  {
    id: '2',
    firstName: 'Sam',
    lastName: 'Wilson',
    email: 'sam.wilson@labflow.med',
    role: 'receptionist',
  },
  {
    id: '3',
    firstName: 'Bruce',
    lastName: 'Banner',
    email: 'bruce.banner@labflow.med',
    role: 'technician',
  },
  {
    id: '4',
    firstName: 'Dr. Stephen',
    lastName: 'Strange',
    email: 'dr.strange@clinic.com',
    role: 'physician',
  },
  {
    id: '5',
    firstName: 'Peter',
    lastName: 'Parker',
    email: 'peter.parker@labflow.med',
    role: 'patient',
  }
];

export const mockTests: TestCatalog[] = [
  {
    _id: 'test-1',
    testCode: 'CBC',
    name: 'Complete Blood Count',
    description: 'A test that measures the cells that make up your blood.',
    specimenRequirements: {
      tubeType: 'Lavender Top',
      minVolume: 3,
      units: 'mL',
    },
    turnaroundTime: {
      routine: { value: 4, units: 'hours' },
      stat: { value: 1, units: 'hours' },
    },
    price: 50.0,
    isPanel: false,
  },
  {
    _id: 'test-2',
    testCode: 'LP',
    name: 'Lipid Panel',
    description:
      'Measures fats and fatty substances used as a source of energy by your body.',
    specimenRequirements: {
      tubeType: 'Gold Top',
      minVolume: 5,
      units: 'mL',
    },
    turnaroundTime: {
      routine: { value: 8, units: 'hours' },
      stat: { value: 2, units: 'hours' },
    },
    price: 100.0,
    isPanel: true,
  },
  {
    _id: 'test-3',
    testCode: 'TSH',
    name: 'Thyroid Stimulating Hormone',
    description: 'Checks your thyroid gland function.',
    specimenRequirements: {
      tubeType: 'Gold Top',
      minVolume: 5,
      units: 'mL',
    },
    turnaroundTime: {
      routine: { value: 6, units: 'hours' },
      stat: { value: 1, units: 'hours' },
    },
    price: 120.0,
    isPanel: false,
  },
];


/**
 * Gets the current user from the request headers.
 * In a real app, this would involve verifying a JWT.
 * For this prototype, we decode a base64 string.
 * @returns The authenticated user or null.
 */
export async function getAuthenticatedUser(): Promise<User | null> {
  const authHeader = headers().get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decodedUser = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'));
    const validatedUser = UserSchema.safeParse(decodedUser);
    if (validatedUser.success) {
      // Find the user in our mock DB to ensure they are valid
      const userExists = mockUsers.find(u => u.id === validatedUser.data.id);
      return userExists ? validatedUser.data : null;
    }
  } catch (error) {
    console.error("Token decoding failed:", error);
    return null;
  }

  return null;
}

/**
 * A middleware-like function to protect routes by role.
 * @param allowedRoles - An array of roles that are allowed to access the route.
 * @returns The user if authenticated and authorized, otherwise null.
 */
export async function protectRoute(allowedRoles: User['role'][]): Promise<User | null> {
    const user = await getAuthenticatedUser();

    if (!user) {
        return null; // Triggers a 401 Unauthorized response
    }

    if (!allowedRoles.includes(user.role)) {
        return null; // Triggers a 403 Forbidden response
    }

    return user;
}
