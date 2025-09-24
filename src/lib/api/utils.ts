
import { User, UserSchema } from '@/lib/schemas/auth';
import type { TestCatalog } from '@/lib/schemas/test-catalog';
import { headers } from 'next/headers';

// This is the initial seed data.
const initialMockUsers: User[] = [
  {
    _id: 'user-1',
    firstName: 'Jane',
    lastName: 'Doe',
    email: 'jane.doe@labflow.med',
    role: 'manager',
  },
  {
    _id: 'user-2',
    firstName: 'Sam',
    lastName: 'Wilson',
    email: 'sam.wilson@labflow.med',
    role: 'receptionist',
  },
  {
    _id: 'user-3',
    firstName: 'Bruce',
    lastName: 'Banner',
    email: 'bruce.banner@labflow.med',
    role: 'technician',
  },
  {
    _id: 'user-4',
    firstName: 'Dr. Stephen',
    lastName: 'Strange',
    email: 'dr.strange@clinic.com',
    role: 'physician',
  },
  {
    _id: 'user-5',
    firstName: 'Peter',
    lastName: 'Parker',
    email: 'peter.parker@labflow.med',
    role: 'patient',
  }
];

const initialMockTests: TestCatalog[] = [
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
    isActive: true,
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
    isActive: true,
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
    isActive: true,
  },
];


// --- SIMULATED DATABASE using Session Storage ---
// In a real app, these functions would interact with a database.
// For this prototype, we use sessionStorage to persist data across refreshes.

let mockUsers: User[] = [...initialMockUsers];
let mockTests: TestCatalog[] = [...initialMockTests];

// We can't use sessionStorage on the server-side directly, so we'll just modify the in-memory arrays.
// This means data will reset on server restart, which is expected for this prototype.

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
      const userExists = mockUsers.find(u => u._id === validatedUser.data._id);
      return userExists ? validatedUser.data : null;
    }
  } catch (error) {
    console.error("Token decoding failed:", error);
    return null;
  }

  return null;
}

// --- User Data Access ---
export const getUsers = () => mockUsers;
export const findUserById = (id: string) => mockUsers.find(u => u._id === id);
export const findUserIndexById = (id: string) => mockUsers.findIndex(u => u._id === id);
export const findUserByEmail = (email: string) => mockUsers.find(u => u.email === email);
export const addUser = (user: User) => {
    mockUsers.push(user);
};
export const updateUser = (index: number, user: User) => {
    mockUsers[index] = user;
};
export const removeUser = (index: number) => {
    mockUsers.splice(index, 1);
};


// --- Test Catalog Data Access ---
export const getTests = () => mockTests;
export const findTestById = (id: string) => mockTests.find(t => t._id === id);
export const findTestIndexById = (id: string) => mockTests.findIndex(t => t._id === id);
export const findTestByCode = (code: string) => mockTests.find(t => t.testCode === code);
export const addTest = (test: TestCatalog) => {
    mockTests.push(test);
};
export const updateTest = (index: number, test: TestCatalog) => {
    mockTests[index] = test;
};
export const removeTest = (index: number) => {
    mockTests.splice(index, 1);
};
