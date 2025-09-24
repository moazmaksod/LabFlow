
import { MongoClient, Db, Collection } from 'mongodb';
import type { User } from '@/lib/schemas/auth';
import type { TestCatalog } from '@/lib/schemas/test-catalog';

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB;

if (!uri) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env');
}
if (!dbName) {
  throw new Error('Please define the MONGODB_DB environment variable inside .env');
}

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const client = new MongoClient(uri!);
  await client.connect();
  const db = client.db(dbName);

  cachedClient = client;
  cachedDb = db;

  return { client, db };
}

export async function getCollection<T extends Document>(name: string): Promise<Collection<T>> {
    const { db } = await connectToDatabase();
    return db.collection<T>(name);
}

// Pre-define collections for type safety
export const getUsersCollection = () => getCollection<User>('users');
export const getTestsCollection = () => getCollection<TestCatalog>('testCatalog');
// Add other collections here as needed
// e.g., export const getOrdersCollection = () => getCollection<Order>('orders');
