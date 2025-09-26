
import { z } from 'zod';

export const UpdateProfileFormSchema = z.object({
    fullName: z.string().min(1, 'Full name is required.'),
    email: z.string().email('Invalid email address.'),
});
export type UpdateProfileFormData = z.infer<typeof UpdateProfileFormSchema>;


export const UpdatePasswordFormSchema = z.object({
    currentPassword: z.string().min(1, 'Current password is required.'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters long.'),
    confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "New passwords don't match",
    path: ["confirmPassword"], // path of error
});
export type UpdatePasswordFormData = z.infer<typeof UpdatePasswordFormSchema>;

    