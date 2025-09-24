
import {z} from 'zod';

const AddressSchema = z.object({
  street: z.string().min(1, { message: "Street is required." }),
  city: z.string().min(1, { message: "City is required." }),
  state: z.string().min(1, { message: "State is required." }),
  zipCode: z.string().min(1, { message: "Zip code is required." }),
  country: z.string().min(1, { message: "Country is required." }),
});

const ContactInfoSchema = z.object({
  phone: z.string().min(1, { message: "Phone number is required." }),
  email: z.string().email().optional().or(z.literal('')),
  address: AddressSchema,
});

const InsuranceInfoSchema = z.object({
  providerName: z.string().min(1, { message: "Provider name is required." }),
  policyNumber: z.string().min(1, { message: "Policy number is required." }),
  groupNumber: z.string().optional(),
  isPrimary: z.boolean().default(true),
});

export const PatientSchema = z.object({
  _id: z.string(), // ObjectId will be a string
  mrn: z.string().min(1, { message: "MRN is required." }).describe("The patient's unique Medical Record Number."),
  firstName: z.string().min(1, { message: "First name is required." }),
  lastName: z.string().min(1, { message: "Last name is required." }),
  dateOfBirth: z.date({ required_error: "Date of birth is required."}),
  gender: z.enum(['Male', 'Female', 'Other', 'Prefer not to say']),
  contactInfo: ContactInfoSchema,
  insuranceInfo: z.array(InsuranceInfoSchema).optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type Patient = z.infer<typeof PatientSchema>;

// Schema for form validation (omits server-generated fields)
export const PatientFormSchema = PatientSchema.omit({
    _id: true,
    createdAt: true,
    updatedAt: true
});

export type PatientFormData = z.infer<typeof PatientFormSchema>;
