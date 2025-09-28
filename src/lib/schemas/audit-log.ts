
import { z } from 'zod';

export const AuditLogActionSchema = z.enum([
    'USER_LOGIN',
    'PATIENT_CREATE',
    'PATIENT_VIEW',
    'ORDER_CREATE',
    'ORDER_VIEW',
    'SAMPLE_ACCESSIONED',
    'RESULT_ENTERED',
    'RESULT_MODIFIED',
    'RESULT_VERIFIED',
    'PAYMENT_RECORDED',
]);

export const AuditLogEntitySchema = z.object({
  collectionName: z.enum(['users', 'patients', 'orders', 'samples']),
  documentId: z.string(), // ObjectId as string
});

export const AuditLogSchema = z.object({
  _id: z.string(), // ObjectId as string
  timestamp: z.date(),
  userId: z.string(), // ObjectId as string
  action: AuditLogActionSchema,
  entity: AuditLogEntitySchema,
  details: z.record(z.any()).optional(),
  ipAddress: z.string().optional(),
});

export type AuditLog = z.infer<typeof AuditLogSchema>;

    