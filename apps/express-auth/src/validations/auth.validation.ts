import { z } from 'zod';

export const registerSchema = z.object({
    email: z.string().trim().email().toLowerCase(),
    password: z.string().min(6, "Password must be at least 6 characters long"),
    firstName: z.string().trim().min(2, "First name must be at least 2 characters long"),
    lastName: z.string().trim().min(2, "Last name must be at least 2 characters long"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
