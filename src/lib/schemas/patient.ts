
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

const DateOfBirthSchema = z.object({
  day: z.coerce.number({invalid_type_error: "Day must be a number."}).int().min(1, {message: "Day must be between 1 and 31."}).max(31, {message: "Day must be between 1 and 31."}).optional(),
  month: z.coerce.number({invalid_type_error: "Month must be a number."}).int().min(1, {message: "Month must be between 1 and 12."}).max(12, {message: "Month must be between 1 and 12."}).optional(),
  year: z.coerce.number({invalid_type_error: "Year must be a number."}).int().min(1900, {message: "Year must be after 1900."}).max(new Date().getFullYear(), {message: "Year cannot be in the future."}).optional(),
}).refine(data => data.day !== undefined && data.month !== undefined && data.year !== undefined, {
    message: "Day, Month, and Year are required.",
    path: ["root"]
}).refine(data => {
    if(!data.day || !data.month || !data.year) return true; // Let previous refine handle it
    const date = new Date(data.year, data.month - 1, data.day);
    return date.getFullYear() === data.year && date.getMonth() === data.month - 1 && date.getDate() === data.day;
}, {
    message: "Invalid date provided.",
    path: ["root"],
}).refine(data => {
    if(!data.day || !data.month || !data.year) return true;
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of day for comparison
    const dob = new Date(data.year, data.month - 1, data.day);
    return dob <= today;
}, {
    message: "Date of birth cannot be in the future.",
    path: ["root"],
});

export const PatientSchema = z.object({
  _id: z.string(), // ObjectId will be a string
  mrn: z.string().min(1, { message: "MRN is required." }).describe("The patient's unique Medical Record Number."),
  fullName: z.string().min(1, { message: "Full name is required." }),
  dateOfBirth: z.union([z.date(), DateOfBirthSchema]),
  gender: z.enum(['Male', 'Female', 'Other', 'Prefer not to say']),
  contactInfo: ContactInfoSchema,
  insuranceInfo: z.array(InsuranceInfoSchema).optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type Patient = z.infer<typeof PatientSchema>;

// Schema for form validation (omits server-generated fields)
export const PatientFormSchema = PatientSchema.omit({
    createdAt: true,
    updatedAt: true,
    dateOfBirth: true,
}).extend({
    dateOfBirth: DateOfBirthSchema,
    _id: z.string().optional(), // Make _id optional for creation
});

export type PatientFormData = z.infer<typeof PatientFormSchema>;
