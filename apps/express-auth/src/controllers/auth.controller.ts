import { Request, Response } from 'express';
import { createSuccessResponse, createErrorResponse, ErrorCode } from '@platform/contracts';
import { userRepository, sessionRepository, passwordResetTokenRepository, emailVerificationTokenRepository } from '@platform/db';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { registerSchema } from '../validations/auth.validation';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { sendVerificationEmail } from '../services/email.service';
dotenv.config({ path: '../../../../.env' });

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables");
}

export const register = async (req: Request, res: Response) => {
    try {
        // Validate and normalize input using Zod
        // This will throw if validation fails
        const { email, password, firstName, lastName } = registerSchema.parse(req.body);

        const existingUser = await userRepository.findByEmail(email);

        if (existingUser) {
            return res.status(400).json(
                createErrorResponse('User already exists', ErrorCode.BAD_REQUEST, 400)
            );
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await userRepository.createCustomer({
            email,
            password: hashedPassword,
            name: `${firstName} ${lastName}`,
        });

        res.status(201).json(
            createSuccessResponse({ userId: user.id }, 'User created successfully', 201)
        );
    } catch (error) {
        if (error instanceof z.ZodError) {
            const validationErrors = error.issues.map(e => ({
                field: e.path.join('.'),
                message: e.message
            }));

            return res.status(400).json(
                createErrorResponse('Validation failed', ErrorCode.BAD_REQUEST, 400, validationErrors)
            );
        }

        console.error('Registration error:', error);
        res.status(500).json(
            createErrorResponse('Internal server error', ErrorCode.INTERNAL_SERVER_ERROR, 500)
        );
    }
};

export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json(
            createErrorResponse('Email and password are required', ErrorCode.BAD_REQUEST, 400)
        );
    }

    try {
        const user = await userRepository.findByEmailWithRoles(email);

        if (!user || !user.password) {
            return res.status(401).json(
                createErrorResponse('Invalid credentials', ErrorCode.UNAUTHORIZED, 401)
            );
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json(
                createErrorResponse('Invalid credentials', ErrorCode.UNAUTHORIZED, 401)
            );
        }

        // Check if email is verified
        if (!user.emailVerified) {
            return res.status(403).json({
                message: 'Please verify your email before logging in. Check your inbox for the verification link.',
                requiresVerification: true
            });
        }

        // Generate Access Token (JWT)
        const accessToken = jwt.sign(
            { userId: user.id, email: user.email, roles: user.userRoles.map(ur => ur.role.name) },
            JWT_SECRET,
            { expiresIn: '15m' }
        );

        // Generate Refresh Token (Session)
        const refreshToken = crypto.randomUUID();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

        await sessionRepository.createSession({
            sessionToken: refreshToken,
            userId: user.id,
            expires: expiresAt,
        });

        res.status(200).json(
            createSuccessResponse({
                accessToken,
                refreshToken
            }, 'Login successful')
        );

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json(
            createErrorResponse('Internal server error', ErrorCode.INTERNAL_SERVER_ERROR, 500)
        );
    }
};

export const refreshToken = async (req: Request, res: Response) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(400).json(
            createErrorResponse('Refresh token is required', ErrorCode.BAD_REQUEST, 400)
        );
    }

    try {
        const session = await sessionRepository.findSession(refreshToken);

        if (!session) {
            return res.status(401).json(
                createErrorResponse('Invalid refresh token', ErrorCode.UNAUTHORIZED, 401)
            );
        }

        if (session.expires < new Date()) {
            await sessionRepository.deleteSession(session.id);
            return res.status(401).json(
                createErrorResponse('Refresh token expired', ErrorCode.UNAUTHORIZED, 401)
            );
        }

        const user = session.user;
        const newAccessToken = jwt.sign(
            { userId: user.id, email: user.email, roles: user.userRoles.map((ur: any) => ur.role.name) },
            JWT_SECRET,
            { expiresIn: '15m' }
        );

        res.status(200).json(
            createSuccessResponse({ accessToken: newAccessToken }, 'Token refreshed successfully')
        );

    } catch (error) {
        console.error('Refresh token error:', error);
        res.status(500).json(
            createErrorResponse('Internal server error', ErrorCode.INTERNAL_SERVER_ERROR, 500)
        );
    }
};

export const forgotPassword = async (req: Request, res: Response) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json(
            createErrorResponse('Email is required', ErrorCode.BAD_REQUEST, 400)
        );
    }

    try {
        const user = await userRepository.findByEmail(email);

        if (!user) {
            // Return success even if user not found to prevent enumeration
            return res.status(200).json(
                createSuccessResponse(null, 'A password reset email has been sent.')
            );
        }

        // Generate reset token
        const token = crypto.randomUUID();
        const expires = new Date();
        expires.setHours(expires.getHours() + 1); // 1 hour expiry

        // Save token to database
        // Note: We might need to handle cleanup of old tokens or make sure email is unique in the reset token table if we want only one active token
        // For now, simple create is fine, or we could delete existing ones for this email first
        await passwordResetTokenRepository.createToken({
            email,
            token,
            expires
        });

        // Mock sending email
        console.log(`[MOCK EMAIL] Password reset token for ${email}: ${token}`);
        // In a real app: await sendEmail(user.email, "Password Reset", `Use this token: ${token}`);

        res.status(200).json(
            createSuccessResponse(null, 'A password reset email has been sent.')
        );
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json(
            createErrorResponse('Internal server error', ErrorCode.INTERNAL_SERVER_ERROR, 500)
        );
    }
};

export const resetPassword = async (req: Request, res: Response) => {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
        return res.status(400).json(
            createErrorResponse('Token and new password are required', ErrorCode.BAD_REQUEST, 400)
        );
    }

    try {
        const resetToken = await passwordResetTokenRepository.findByToken(token);

        if (!resetToken) {
            return res.status(400).json(
                createErrorResponse('Invalid or expired token', ErrorCode.BAD_REQUEST, 400)
            );
        }

        if (resetToken.expires < new Date()) {
            await passwordResetTokenRepository.deleteToken(resetToken.id);
            return res.status(400).json(
                createErrorResponse('Invalid or expired token', ErrorCode.BAD_REQUEST, 400)
            );
        }

        const user = await userRepository.findByEmail(resetToken.email);

        if (!user) {
            return res.status(400).json(
                createErrorResponse('User no longer exists', ErrorCode.BAD_REQUEST, 400)
            );
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await userRepository.updatePassword(user.id, hashedPassword);

        // Delete the used token
        await passwordResetTokenRepository.deleteToken(resetToken.id);

        // Optional: Delete all other tokens for this email?
        // await prisma.passwordResetToken.deleteMany({ where: { email: resetToken.email } });

        res.status(200).json(
            createSuccessResponse(null, 'Password reset successful')
        );

    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json(
            createErrorResponse('Internal server error', ErrorCode.INTERNAL_SERVER_ERROR, 500)
        );
    }
};

/**
 * Verify email with token
 */
export const verifyEmail = async (req: Request, res: Response) => {
    const { token } = req.body;

    if (!token) {
        return res.status(400).json(
            createErrorResponse('Verification token is required', ErrorCode.BAD_REQUEST, 400)
        );
    }

    try {
        const verificationToken = await emailVerificationTokenRepository.findByToken(token);

        if (!verificationToken) {
            return res.status(400).json(
                createErrorResponse('Invalid or expired verification token', ErrorCode.BAD_REQUEST, 400)
            );
        }

        if (verificationToken.expires < new Date()) {
            await emailVerificationTokenRepository.deleteToken(verificationToken.id);
            return res.status(400).json(
                createErrorResponse('Verification token has expired. Please request a new one.', ErrorCode.BAD_REQUEST, 400)
            );
        }

        const user = await userRepository.findByEmail(verificationToken.email);

        if (!user) {
            return res.status(400).json(
                createErrorResponse('User not found', ErrorCode.BAD_REQUEST, 400)
            );
        }

        if (user.emailVerified) {
            return res.status(400).json(
                createErrorResponse('Email is already verified', ErrorCode.BAD_REQUEST, 400)
            );
        }

        // Update user's emailVerified field
        await userRepository.verifyEmail(user.id);

        // Delete the used token
        await emailVerificationTokenRepository.deleteToken(verificationToken.id);

        // Delete all other verification tokens for this email
        await emailVerificationTokenRepository.deleteByEmail(verificationToken.email);

        res.status(200).json(
            createSuccessResponse({}, 'Email verified successfully! You can now log in.')
        );

    } catch (error) {
        console.error('Email verification error:', error);
        res.status(500).json(
            createErrorResponse('Internal server error', ErrorCode.INTERNAL_SERVER_ERROR, 500)
        );
    }
};

/**
 * Resend verification email
 */
export const resendVerificationEmail = async (req: Request, res: Response) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json(
            createErrorResponse('Email is required', ErrorCode.BAD_REQUEST, 400)
        );
    }

    try {
        const user = await userRepository.findByEmail(email);

        if (!user) {
            // Return success even if user not found to prevent enumeration
            return res.status(200).json(
                createSuccessResponse({}, 'If an account exists with this email, a verification email has been sent.')
            );
        }

        if (user.emailVerified) {
            return res.status(400).json(
                createErrorResponse('Email is already verified', ErrorCode.BAD_REQUEST, 400)
            );
        }

        // Delete any existing verification tokens for this email
        await emailVerificationTokenRepository.deleteByEmail(email);

        // Generate new verification token
        const verificationToken = crypto.randomUUID();
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours expiry

        // Save verification token to database
        await emailVerificationTokenRepository.createToken({
            email,
            token: verificationToken,
            expires: expiresAt
        });

        // Send verification email
        await sendVerificationEmail(email, verificationToken);

        res.status(200).json(
            createSuccessResponse({}, 'Verification email has been sent. Please check your inbox.')
        );

    } catch (error) {
        console.error('Resend verification error:', error);
        res.status(500).json(
            createErrorResponse('Internal server error', ErrorCode.INTERNAL_SERVER_ERROR, 500)
        );
    }
};
