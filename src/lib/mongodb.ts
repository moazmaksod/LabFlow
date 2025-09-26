
import { MongoClient, Db, Collection } from 'mongodb';
import type { User } from '@/lib/schemas/auth';
import type { TestCatalog } from '@/lib/schemas/test-catalog';
import type { Patient } from '@/lib/schemas/patient';
import type { Order } from '@/lib/schemas/order';
import type { Appointment } from '@/lib/schemas/appointment';
import type { AuditLog } from '@/lib/schemas/audit-log';

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
    { fullName: 'Dr. Evelyn Reed', email: 'evelyn.reed@labflow.med', role: 'manager' },
    { fullName: 'David Chen', email: 'david.chen@labflow.med', role: 'receptionist' },
    { fullName: 'Maria Garcia', email: 'maria.garcia@labflow.med', role: 'technician' },
    { fullName: 'Dr. Ben Carter', email: 'ben.carter@clinic.com', role: 'physician' },
    { fullName: 'Sarah Johnson', email: 'sarah.johnson@email.com', role: 'patient' },
];

const initialTests: Omit<TestCatalog, '_id'>[] = [
  {
    testCode: 'CBC',
    name: 'Complete Blood Count w/ Diff',
    description: 'A comprehensive test that measures the cells that make up your blood: red blood cells, white blood cells, and platelets.',
    specimenRequirements: { tubeType: 'Lavender Top', minVolume: 3, units: 'mL' },
    turnaroundTime: { routine: { value: 4, units: 'hours' }, stat: { value: 1, units: 'hours' } },
    price: 75.00,
    isPanel: true,
    panelComponents: ['WBC', 'RBC', 'HGB', 'HCT', 'PLT'],
    isActive: true,
    referenceRanges: [
        { ageMin: 18, ageMax: 99, gender: 'Male', rangeLow: 4.5, rangeHigh: 5.9, units: '10^6/µL', interpretiveText: 'RBC Count' },
        { ageMin: 18, ageMax: 99, gender: 'Female', rangeLow: 4.0, rangeHigh: 5.2, units: '10^6/µL', interpretiveText: 'RBC Count' },
        { ageMin: 18, ageMax: 99, gender: 'Any', rangeLow: 150, rangeHigh: 450, units: '10^3/µL', interpretiveText: 'Platelet Count' }
    ],
    reflexRules: [],
  },
  {
    testCode: 'BMP',
    name: 'Basic Metabolic Panel',
    description: 'Measures key electrolytes, kidney function, and glucose levels.',
    specimenRequirements: { tubeType: 'Gold Top', minVolume: 5, units: 'mL' },
    turnaroundTime: { routine: { value: 6, units: 'hours' }, stat: { value: 1, units: 'hours' } },
    price: 125.0,
    isPanel: true,
    panelComponents: ['GLU', 'NA', 'K', 'CL', 'CO2', 'BUN', 'CREAT'],
    isActive: true,
    referenceRanges: [],
    reflexRules: [],
  },
   {
    testCode: 'GLU',
    name: 'Glucose',
    description: 'Measures the amount of sugar in your blood. Often used to check for diabetes.',
    specimenRequirements: { tubeType: 'Gold Top', minVolume: 1, units: 'mL' },
    turnaroundTime: { routine: { value: 6, units: 'hours' }, stat: { value: 1, units: 'hours' } },
    price: 40.0,
    isPanel: false,
    isActive: true,
    referenceRanges: [
         { ageMin: 0, ageMax: 99, gender: 'Any', rangeLow: 70, rangeHigh: 99, units: 'mg/dL', interpretiveText: 'Fasting Glucose' }
    ],
    reflexRules: [],
  },
  {
    testCode: 'TSH',
    name: 'Thyroid Stimulating Hormone',
    description: 'Checks your thyroid gland function, which regulates metabolism.',
    specimenRequirements: { tubeType: 'Gold Top', minVolume: 5, units: 'mL' },
    turnaroundTime: { routine: { value: 8, units: 'hours' }, stat: { value: 2, units: 'hours' } },
    price: 95.0,
    isPanel: false,
    isActive: true,
    referenceRanges: [
        { ageMin: 18, ageMax: 99, gender: 'Any', rangeLow: 0.4, rangeHigh: 4.0, units: 'mIU/L' }
    ],
    reflexRules: [
        { condition: { testCode: 'TSH', operator: 'gt', value: 4.0 }, action: { addTestCode: 'FT4' } }
    ],
  },
  {
    testCode: 'LIPID',
    name: 'Lipid Panel',
    description: 'Measures fats and fatty substances used as a source of energy by your body, including cholesterol, triglycerides, HDL, and LDL.',
    specimenRequirements: { tubeType: 'Gold Top', minVolume: 5, units: 'mL' },
    turnaroundTime: { routine: { value: 12, units: 'hours' }, stat: { value: 2, units: 'hours' } },
    price: 150.00,
    isPanel: true,
    panelComponents: ['CHOL', 'TRIG', 'HDL', 'LDL'],
    isActive: true,
    referenceRanges: [],
    reflexRules: [],
  },
  {
    testCode: 'A1C',
    name: 'Hemoglobin A1c',
    description: 'Provides an average of your blood sugar control over the past 2 to 3 months.',
    specimenRequirements: { tubeType: 'Lavender Top', minVolume: 3, units: 'mL' },
    turnaroundTime: { routine: { value: 24, units: 'hours' }, stat: { value: 4, units: 'hours' } },
    price: 85.00,
    isPanel: false,
    isActive: true,
    referenceRanges: [
        { ageMin: 0, ageMax: 99, gender: 'Any', rangeLow: 4.0, rangeHigh: 5.6, units: '%', interpretiveText: 'Normal' },
        { ageMin: 0, ageMax: 99, gender: 'Any', rangeLow: 5.7, rangeHigh: 6.4, units: '%', interpretiveText: 'Prediabetes' },
    ],
    reflexRules: [],
  },
  {
    testCode: 'NA',
    name: 'Sodium',
    description: 'Measures the level of sodium in your blood.',
    specimenRequirements: { tubeType: 'Gold Top', minVolume: 1, units: 'mL' },
    turnaroundTime: { routine: { value: 4, units: 'hours' }, stat: { value: 1, units: 'hours' } },
    price: 35.00,
    isPanel: false,
    isActive: true,
    referenceRanges: [
        { ageMin: 0, ageMax: 99, gender: 'Any', rangeLow: 135, rangeHigh: 145, units: 'mmol/L', interpretiveText: '' },
    ],
    reflexRules: [],
  },
   {
    testCode: 'K',
    name: 'Potassium',
    description: 'Measures the level of potassium in your blood.',
    specimenRequirements: { tubeType: 'Gold Top', minVolume: 1, units: 'mL' },
    turnaroundTime: { routine: { value: 4, units: 'hours' }, stat: { value: 1, units: 'hours' } },
    price: 35.00,
    isPanel: false,
    isActive: true,
    referenceRanges: [
        { ageMin: 0, ageMax: 99, gender: 'Any', rangeLow: 3.5, rangeHigh: 5.2, units: 'mmol/L', interpretiveText: '' },
    ],
    reflexRules: [],
  },
];

const initialPatients: Omit<Patient, '_id' | 'createdAt' | 'updatedAt'>[] = [
    {
        mrn: 'SJ-0001',
        fullName: 'Sarah Johnson',
        dateOfBirth: new Date('1985-05-20T00:00:00.000Z'),
        gender: 'Female',
        contactInfo: {
            phone: '555-0101',
            email: 'sarah.johnson@email.com',
            address: { street: '123 Maple St', city: 'Metropolis', state: 'NY', zipCode: '10001', country: 'USA' }
        },
        insuranceInfo: [{ providerName: 'MetroHealth Plus', policyNumber: 'MH456789', isPrimary: true }]
    },
    {
        mrn: 'BW-0002',
        fullName: 'Brian Williams',
        dateOfBirth: new Date('1972-11-02T00:00:00.000Z'),
        gender: 'Male',
        contactInfo: {
            phone: '555-0102',
            email: 'brian.williams@email.com',
            address: { street: '456 Oak Ave', city: 'Metropolis', state: 'NY', zipCode: '10002', country: 'USA' }
        },
        insuranceInfo: [{ providerName: 'National Health', policyNumber: 'NH123456', isPrimary: true }]
    },
    {
        mrn: 'ED-0003',
        fullName: 'Emily Davis',
        dateOfBirth: new Date('1998-01-15T00:00:00.000Z'),
        gender: 'Female',
        contactInfo: {
            phone: '555-0103',
            email: 'emily.davis@email.com',
            address: { street: '789 Pine Ln', city: 'Gotham', state: 'NJ', zipCode: '07001', country: 'USA' }
        },
        insuranceInfo: [{ providerName: 'Gotham General', policyNumber: 'GG987654', isPrimary: true }]
    },
    {
        mrn: 'MB-0004',
        fullName: 'Michael Brown',
        dateOfBirth: new Date('1965-09-30T00:00:00.000Z'),
        gender: 'Male',
        contactInfo: {
            phone: '555-0104',
            email: 'michael.brown@email.com',
            address: { street: '101 Birch Rd', city: 'Star City', state: 'CA', zipCode: '90210', country: 'USA' }
        },
        insuranceInfo: [{ providerName: 'Coastline Coverage', policyNumber: 'CC555111', isPrimary: true }]
    },
];


async function seedDatabase(db: Db) {
    const usersCollection = db.collection('users');
    const userCount = await usersCollection.countDocuments();
    
    // Only seed if the users collection is empty
    if (userCount === 0) {
        console.log('Empty `users` collection detected. Seeding database with initial data...');
        
        const testsCollection = db.collection('testCatalog');
        const patientsCollection = db.collection('patients');
        const countersCollection = db.collection('counters');

        await usersCollection.insertMany(initialUsers as any[]);
        console.log('Seeded `users` collection.');

        await testsCollection.insertMany(initialTests as any[]);
        console.log('Seeded `testCatalog` collection.');
        
        const patientsWithTimestamps = initialPatients.map(p => ({
            ...p,
            createdAt: new Date(),
            updatedAt: new Date(),
        }));
        await patientsCollection.insertMany(patientsWithTimestamps as any[]);
        console.log('Seeded `patients` collection.');

        await countersCollection.insertOne({ _id: 'accessionNumber', sequence_value: 0 });
        console.log('Seeded `counters` collection.');

        console.log('Database seeding complete.');
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
    
    const appointmentsCollection = db.collection('appointments');
    await appointmentsCollection.createIndex({ scheduledTime: 1 });
    console.log('Created index on `appointments.scheduledTime`');

    const auditLogsCollection = db.collection('auditLogs');
    await auditLogsCollection.createIndex({ timestamp: -1 });
    await auditLogsCollection.createIndex({ "entity.documentId": 1 });
    await auditLogsCollection.createIndex({ userId: 1 });
    console.log('Created indexes on `auditLogs`');
}


async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const client = new MongoClient(uri!);
  await client.connect();
  const db = client.db(dbName);
  
  // Seed the database with initial data ONLY if it's empty
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
export const getAppointmentsCollection = () => getCollection<Appointment>('appointments');
export const getAuditLogsCollection = () => getCollection<AuditLog>('auditLogs');
export const getCountersCollection = () => getCollection<any>('counters');

    

    