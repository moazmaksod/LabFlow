
import {z} from 'zod';

const AddressSchema = z.object({
  street: z.string(),
  city: z.string(),
  state: z.string(),
  zipCode: z.string(),
  country: z.string(),
});

const ContactInfoSchema = z.object({
  phone: z.string(),
  email: z.string().email().optional(),
  address: AddressSchema,
});

const InsuranceInfoSchema = z.object({
  providerName: z.string(),
  policyNumber: z.string(),
  groupNumber: z.string().optional(),
  isPrimary: z.boolean(),
});

export const PatientSchema = z.object({
  _id: z.string(), // ObjectId will be a string
  mrn: z.string().describe("The patient's unique Medical Record Number."),
  firstName: z.string(),
  lastName: z.string(),
  dateOfBirth: z.date(),
  gender: z.enum(['Male', 'Female', 'Other', 'Prefer not to say']).optional(),
  contactInfo: ContactInfoSchema,
  insuranceInfo: z.array(InsuranceInfoSchema).optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type Patient = z.infer<typeof PatientSchema>;
