
import { z } from 'zod';
import { ReferenceRangeSchema } from './test-catalog';

// This sub-schema represents a single test that has been "snapshotted" into an order.
// It captures the state of the test at the time of ordering for compliance.
const SnapshottedTestSchema = z.object({
  testCode: z.string(),
  name: z.string(),
  status: z.enum(['Pending', 'In Progress', 'AwaitingVerification', 'Verified', 'Cancelled']).default('Pending'),
  resultValue: z.any().optional(),
  resultUnits: z.string().optional(),
  referenceRange: z.string().optional(), // The snapshotted range as a formatted string
  isAbnormal: z.boolean().optional(),
  isCritical: z.boolean().optional(),
  flags: z.array(z.string()).optional(),
  notes: z.string().optional(),
  verifiedBy: z.string().optional(), // ObjectId as string
  verifiedAt: z.date().optional(),
});

// This sub-schema represents a physical sample (e.g., a tube of blood).
const SampleSchema = z.object({
  accessionNumber: z.string().optional(), // Assigned upon receipt in the lab
  sampleType: z.string(), // E.g., "Whole Blood", "Serum". From test catalog.
  collectionTimestamp: z.date().optional(),
  receivedTimestamp: z.date().optional(),
  status: z.enum(['AwaitingCollection', 'InLab', 'Testing', 'AwaitingVerification', 'Verified', 'Rejected', 'Archived', 'Disposed']).default('AwaitingCollection'),
  rejectionInfo: z.object({
    reason: z.string(),
    notifiedUser: z.string(),
    notificationMethod: z.string(),
    timestamp: z.date(),
    rejectedBy: z.string(), // ObjectId as string
  }).optional(),
  storageLocation: z.string().optional(),
  tests: z.array(SnapshottedTestSchema),
});


export const OrderSchema = z.object({
  _id: z.string(), // ObjectId as string
  orderId: z.string(), // Human-readable ID
  patientId: z.string(), // ObjectId as string
  physicianId: z.string().optional(), // ObjectId as string
  icd10Code: z.string(),
  orderStatus: z.enum(['Pending', 'Partially Complete', 'Complete', 'Cancelled']).default('Pending'),
  priority: z.enum(['Routine', 'STAT']).default('Routine'),
  clinicalJustification: z.string().optional(), // Required for STAT
  samples: z.array(SampleSchema),
  createdAt: z.date(),
  createdBy: z.string(), // ObjectId as string
  updatedAt: z.date(),
  // This is a temporary field for the frontend to easily join patient data
  patientDetails: z.object({
    _id: z.string(),
    fullName: z.string(),
    mrn: z.string(),
  }).optional(),
});
export type Order = z.infer<typeof OrderSchema>;


// Schema for the API request body when creating a new order
export const CreateOrderInputSchema = z.object({
    patientId: z.string(),
    physicianId: z.string().optional(),
    icd10Code: z.string().min(1, 'ICD-10 code is required'),
    priority: z.enum(['Routine', 'STAT']).default('Routine'),
    testCodes: z.array(z.string()).min(1, 'At least one test must be selected'),
    notes: z.string().optional(),
});
export type CreateOrderInput = z.infer<typeof CreateOrderInputSchema>;
