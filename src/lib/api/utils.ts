
import { User, UserSchema } from '@/lib/schemas/auth';
import type { TestCatalog } from '@/lib/schemas/test-catalog';
import { headers } from 'next/headers';
import { getUsersCollection, getTestsCollection } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';


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
      const collection = await getUsersCollection();
      const userExists = await collection.findOne({ _id: new ObjectId(validatedUser.data._id) as any });
      return userExists ? validatedUser.data : null;
    }
  } catch (error) {
    console.error("Token decoding or DB validation failed:", error);
    return null;
  }

  return null;
}

// --- User Data Access ---
export const getUsers = async (): Promise<User[]> => {
    const collection = await getUsersCollection();
    return await collection.find({}).toArray() as User[];
};
export const findUserById = async (id: string): Promise<User | null> => {
    const collection = await getUsersCollection();
    return await collection.findOne({ _id: new ObjectId(id) as any }) as User | null;
};
export const findUserByEmail = async (email: string): Promise<User | null> => {
    const collection = await getUsersCollection();
    return await collection.findOne({ email: email }) as User | null;
};
export const addUser = async (user: Omit<User, '_id'>): Promise<User> => {
    const collection = await getUsersCollection();
    const result = await collection.insertOne(user as any);
    return { ...user, _id: result.insertedId.toHexString() };
};
export const updateUser = async (id: string, updates: Partial<User>): Promise<boolean> => {
    const collection = await getUsersCollection();
    const result = await collection.updateOne({ _id: new ObjectId(id) as any }, { $set: updates });
    return result.modifiedCount > 0;
};
export const removeUser = async (id: string): Promise<boolean> => {
    const collection = await getUsersCollection();
    const result = await collection.deleteOne({ _id: new ObjectId(id) as any });
    return result.deletedCount > 0;
};


// --- Test Catalog Data Access ---
export const getTests = async (): Promise<TestCatalog[]> => {
    const collection = await getTestsCollection();
    return await collection.find({}).toArray() as TestCatalog[];
};
export const findTestById = async (id: string): Promise<TestCatalog | null> => {
    const collection = await getTestsCollection();
    return await collection.findOne({ _id: new ObjectId(id) as any }) as TestCatalog | null;
};
export const findTestByCode = async (code: string): Promise<TestCatalog | null> => {
    const collection = await getTestsCollection();
    return await collection.findOne({ testCode: code }) as TestCatalog | null;
};
export const addTest = async (test: Omit<TestCatalog, '_id'>): Promise<TestCatalog> => {
    const collection = await getTestsCollection();
    const result = await collection.insertOne(test as any);
    return { ...test, _id: result.insertedId.toHexString() };
};
export const updateTest = async (id: string, updates: Partial<TestCatalog>): Promise<boolean> => {
    const collection = await getTestsCollection();
    const result = await collection.updateOne({ _id: new ObjectId(id) as any }, { $set: updates });
    return result.modifiedCount > 0;
};
export const removeTest = async (id: string): Promise<boolean> => {
    const collection = await getTestsCollection();
    const result = await collection.deleteOne({ _id: new ObjectId(id) as any });
    return result.deletedCount > 0;
};
