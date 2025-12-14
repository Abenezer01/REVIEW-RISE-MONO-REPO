import { z } from 'zod';

export const registerSchema = z.object({
    email: z.string().trim().email().toLowerCase(),
    password: z.string().min(6, "Password must be at least 6 characters long"),
    firstName: z.string().trim().min(2, "First name must be at least 2 characters long"),
    lastName: z.string().trim().min(2, "Last name must be at least 2 characters long"),
});

export const loginSchema = z.object({
    email: z.string().trim().email().toLowerCase(),
    password: z.string().min(1, "Password is required"),
});

export const refreshTokenSchema = z.object({
    refreshToken: z.string().min(1, "Refresh token is required"),
});

export const forgotPasswordSchema = z.object({
    email: z.string().trim().email().toLowerCase(),
});

export const resetPasswordSchema = z.object({
    token: z.string().min(1, "Reset token is required"),
    newPassword: z.string().min(6, "Password must be at least 6 characters long"),
});

export const verifyEmailSchema = z.object({
    token: z.string().min(1, "Verification token is required"),
});

export const resendVerificationEmailSchema = z.object({
    email: z.string().trim().email().toLowerCase(),
});

// Type exports
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;
export type ResendVerificationEmailInput = z.infer<typeof resendVerificationEmailSchema>;
