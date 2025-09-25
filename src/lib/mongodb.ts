
import { MongoClient, Db, Collection } from 'mongodb';
import type { User } from '@/lib/schemas/auth';
import type { TestCatalog } from '@/lib/schemas/test-catalog';
import type { Patient } from '@/lib/schemas/patient';
import type { Order } from '@/lib/schemas/order';

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

const initialUsers: Omit<User, '_id'>[] = [
    {
        fullName: 'Jane Doe',
        email: 'jane.doe@labflow.med',
        role: 'manager',
    },
    {
        fullName: 'Sam Wilson',
        email: 'sam.wilson@labflow.med',
        role: 'receptionist',
    },
    {
        fullName: 'Bruce Banner',
        email: 'bruce.banner@labflow.med',
        role: 'technician',
    },
];

const initialTests: Omit<TestCatalog, '_id'>[] = [
  {
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
    referenceRanges: [],
    reflexRules: [],
  },
  {
    testCode: 'LP',
    name: 'Lipid Panel',
    description: 'Measures fats and fatty substances used as a source of energy by your body.',
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
    panelComponents: ['CHOL', 'TRIG', 'HDL', 'LDL'],
    isActive: true,
    referenceRanges: [],
    reflexRules: [],
  },
  {
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
    referenceRanges: [],
    reflexRules: [],
  },
];


async function seedDatabase(db: Db) {
    const usersCollection = db.collection('users');
    const testsCollection = db.collection('testCatalog');

    const userCount = await usersCollection.countDocuments();
    if (userCount === 0) {
        console.log('Seeding `users` collection with initial data...');
        await usersCollection.insertMany(initialUsers as any[]);
    }

    const testCount = await testsCollection.countDocuments();
    if (testCount === 0) {
        console.log('Seeding `testCatalog` collection with initial data...');
        await testsCollection.insertMany(initialTests as any[]);
    }
}

async function applyIndexes(db: Db) {
    console.log('Applying database indexes...');
    const usersCollection = db.collection('users');
    await usersCollection.createIndex({ email: 1 }, { unique: true });
    console.log('Created unique index on `users.email`');

    const testCatalogCollection = db.collection('testCatalog');
    await testCatalogCollection.createIndex({ testCode: 1 }, { unique: true });
    console.log('Created unique index on `testCatalog.testCode`');

    const patientsCollection = db.collection('patients');
    await patientsCollection.createIndex({ mrn: 1 }, { unique: true });
    console.log('Created unique index on `patients.mrn`');
    await patientsCollection.createIndex({ fullName: 1 });
    console.log('Created index on `patients.fullName`');
}


async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const client = new MongoClient(uri!);
  await client.connect();
  const db = client.db(dbName);
  
  // Seed the database with initial data if it's empty
  await seedDatabase(db);
  // Ensure all required indexes are applied
  await applyIndexes(db);

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
export const getPatientsCollection = () => getCollection<Patient>('patients');
export const getOrdersCollection = () => getCollection<Order>('orders');
