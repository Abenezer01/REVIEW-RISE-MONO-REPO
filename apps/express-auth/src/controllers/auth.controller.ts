import { Request, Response } from 'express';
import { createSuccessResponse, createErrorResponse, SystemMessageCode } from '@platform/contracts';
import { userRepository, sessionRepository, passwordResetTokenRepository, emailVerificationTokenRepository } from '@platform/db';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import {
    registerSchema,
    loginSchema,
    refreshTokenSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
    verifyEmailSchema,
    resendVerificationEmailSchema
} from '../validations/auth.validation';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { sendVerificationEmail } from '../services/notification.service';
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
            const response = createErrorResponse('User already exists', SystemMessageCode.AUTH_USER_ALREADY_EXISTS, 400, undefined, req.id);
            return res.status(response.statusCode).json(response);
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await userRepository.createCustomer({
            email,
            password: hashedPassword,
            name: `${firstName} ${lastName}`,
        });

        const response = createSuccessResponse({ userId: user.id }, 'User created successfully', 201, { requestId: req.id }, SystemMessageCode.AUTH_REGISTER_SUCCESS);
        res.status(response.statusCode).json(response);
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            const validationErrors = error.issues.map(e => ({
                field: e.path.join('.'),
                message: e.message
            }));

            const response = createErrorResponse('Validation failed', SystemMessageCode.VALIDATION_ERROR, 400, validationErrors, req.id);
            return res.status(response.statusCode).json(response);
        }

        // eslint-disable-next-line no-console
        console.error('Registration error:', error);
        const response = createErrorResponse('Internal server error', SystemMessageCode.INTERNAL_SERVER_ERROR, 500, error.message, req.id);
        res.status(response.statusCode).json(response);
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = loginSchema.parse(req.body);

        const user = await userRepository.findByEmailWithRoles(email);

        if (!user || !user.password) {
            // console.log('User not found or no password', user);
            const response = createErrorResponse('Invalid credentials', SystemMessageCode.AUTH_INVALID_CREDENTIALS, 401, undefined, req.id);
            return res.status(response.statusCode).json(response);
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        // console.log('isValidPassword', isValidPassword);
        if (!isValidPassword) {
            const response = createErrorResponse('Invalid credentials', SystemMessageCode.AUTH_INVALID_CREDENTIALS, 401, undefined, req.id);
            return res.status(response.statusCode).json(response);
        }

        // Check if email is verified
        if (!user.emailVerified) {
            const response = createErrorResponse('Please verify your email before logging in', SystemMessageCode.AUTH_EMAIL_NOT_VERIFIED, 403, {
                requiresVerification: true
            }, req.id);
            return res.status(response.statusCode).json(response);
        }

        // Extract Default Location ID
        const defaultLocationId = user.userBusinessRoles?.[0]?.business?.locations?.[0]?.id;

        // Generate Access Token (JWT)
        const accessToken = jwt.sign(
            { 
                userId: user.id, 
                email: user.email, 
                roles: user.userRoles.map(ur => ur.role.name),
                locationId: defaultLocationId // Attach locationId to token
            },
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

        const userResponse = {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            role: user.userRoles?.[0]?.role?.name || 'user',
            locationId: defaultLocationId // Attach to user object response
        };

        const response = createSuccessResponse({
            user: userResponse,
            accessToken,
            refreshToken
        }, 'Login successful', 200, { requestId: req.id }, SystemMessageCode.AUTH_LOGIN_SUCCESS);
        res.status(response.statusCode).json(response);

    } catch (error: any) {
        if (error instanceof z.ZodError) {
            const validationErrors = error.issues.map(e => ({
                field: e.path.join('.'),
                message: e.message
            }));

            const response = createErrorResponse('Validation failed', SystemMessageCode.VALIDATION_ERROR, 400, validationErrors, req.id);
            return res.status(response.statusCode).json(response);
        }

        // eslint-disable-next-line no-console
        console.error('Login error:', error);
        const response = createErrorResponse('Internal server error', SystemMessageCode.INTERNAL_SERVER_ERROR, 500, error.message, req.id);
        res.status(response.statusCode).json(response);
    }
};

export const refreshToken = async (req: Request, res: Response) => {
    try {
        const { refreshToken } = refreshTokenSchema.parse(req.body);

        const session = await sessionRepository.findSession(refreshToken);

        if (!session) {
            const response = createErrorResponse('Invalid refresh token', SystemMessageCode.AUTH_INVALID_TOKEN, 401, undefined, req.id);
            return res.status(response.statusCode).json(response);
        }

        if (session.expires < new Date()) {
            await sessionRepository.deleteSession(session.id);
            const response = createErrorResponse('Refresh token expired', SystemMessageCode.AUTH_TOKEN_EXPIRED, 401, undefined, req.id);
            return res.status(response.statusCode).json(response);
        }

        const user = session.user;
        const newAccessToken = jwt.sign(
            { userId: user.id, email: user.email, roles: user.userRoles.map((ur: any) => ur.role.name) },
            JWT_SECRET,
            { expiresIn: '15m' }
        );

        const response = createSuccessResponse({ accessToken: newAccessToken }, 'Token refreshed successfully', 200, { requestId: req.id }, SystemMessageCode.SUCCESS);
        res.status(response.statusCode).json(response);

    } catch (error: any) {
        if (error instanceof z.ZodError) {
            const validationErrors = error.issues.map(e => ({
                field: e.path.join('.'),
                message: e.message
            }));

            const response = createErrorResponse('Validation failed', SystemMessageCode.VALIDATION_ERROR, 400, validationErrors, req.id);
            return res.status(response.statusCode).json(response);
        }

        // eslint-disable-next-line no-console
        console.error('Refresh token error:', error);
        const response = createErrorResponse('Internal server error', SystemMessageCode.INTERNAL_SERVER_ERROR, 500, error.message, req.id);
        res.status(response.statusCode).json(response);
    }
};

export const me = async (req: Request, res: Response) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            const response = createErrorResponse('Missing or invalid authorization header', SystemMessageCode.UNAUTHORIZED, 401, undefined, req.id);
            return res.status(response.statusCode).json(response);
        }
        const token = authHeader.substring('Bearer '.length);
        const payload = jwt.verify(token, JWT_SECRET) as any;
        const roles = Array.isArray(payload.roles) ? payload.roles : [];
        const user = {
            id: payload.userId,
            email: payload.email,
            role: roles[0] || 'user',
            locationId: payload.locationId // Return from token payload
        };
        const response = createSuccessResponse({ user }, 'User fetched successfully', 200, { requestId: req.id }, SystemMessageCode.SUCCESS);
        res.status(response.statusCode).json(response);
    } catch (error: any) {
        // eslint-disable-next-line no-console
        console.error('Me error:', error);
        const response = createErrorResponse('Invalid token', SystemMessageCode.AUTH_INVALID_TOKEN, 401, error.message, req.id);
        return res.status(response.statusCode).json(response);
    }
};

export const forgotPassword = async (req: Request, res: Response) => {
    try {
        const { email } = forgotPasswordSchema.parse(req.body);

        const user = await userRepository.findByEmail(email);

        if (!user) {
            // Return success even if user not found to prevent enumeration
            const response = createErrorResponse('Invalid credentials', SystemMessageCode.AUTH_INVALID_CREDENTIALS, 401, undefined, req.id);
            return res.status(response.statusCode).json(response);
        }

        // Generate reset token
        const token = crypto.randomUUID();
        const expires = new Date();
        expires.setHours(expires.getHours() + 1); // 1 hour expiry

        // Save token to database
        await passwordResetTokenRepository.createToken({
            email,
            token,
            expires
        });

        // Mock sending email
        // eslint-disable-next-line no-console
        console.log(`[MOCK EMAIL] Password reset token for ${email}: ${token}`);
        // In a real app: await sendEmail(user.email, "Password Reset", `Use this token: ${token}`);

        const response = createSuccessResponse({}, 'A password reset email has been sent.', 200, { requestId: req.id }, SystemMessageCode.AUTH_PASSWORD_RESET_EMAIL_SENT);
        res.status(response.statusCode).json(response);
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            const validationErrors = error.issues.map(e => ({
                field: e.path.join('.'),
                message: e.message
            }));

            const response = createErrorResponse('Validation failed', SystemMessageCode.VALIDATION_ERROR, 400, validationErrors, req.id);
            return res.status(response.statusCode).json(response);
        }

        // eslint-disable-next-line no-console
        console.error('Forgot password error:', error);
        const response = createErrorResponse('Internal server error', SystemMessageCode.INTERNAL_SERVER_ERROR, 500, error.message, req.id);
        res.status(response.statusCode).json(response);
    }
};

export const resetPassword = async (req: Request, res: Response) => {
    try {
        const { token, newPassword } = resetPasswordSchema.parse(req.body);

        const resetToken = await passwordResetTokenRepository.findByToken(token);

        if (!resetToken) {
            const response = createErrorResponse('Invalid or expired token', SystemMessageCode.AUTH_INVALID_TOKEN, 400, undefined, req.id);
            return res.status(response.statusCode).json(response);
        }

        if (resetToken.expires < new Date()) {
            await passwordResetTokenRepository.deleteToken(resetToken.id);
            const response = createErrorResponse('Invalid or expired token', SystemMessageCode.AUTH_TOKEN_EXPIRED, 400, undefined, req.id);
            return res.status(response.statusCode).json(response);
        }

        const user = await userRepository.findByEmail(resetToken.email);

        if (!user) {
            const response = createErrorResponse('User no longer exists', SystemMessageCode.AUTH_USER_NOT_FOUND, 400, undefined, req.id);
            return res.status(response.statusCode).json(response);
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await userRepository.updatePassword(user.id, hashedPassword);

        // Delete the used token
        await passwordResetTokenRepository.deleteToken(resetToken.id);

        const response = createSuccessResponse({}, 'Password reset successful', 200, { requestId: req.id }, SystemMessageCode.AUTH_PASSWORD_RESET_SUCCESS);
        res.status(response.statusCode).json(response);

    } catch (error: any) {
        if (error instanceof z.ZodError) {
            const validationErrors = error.issues.map(e => ({
                field: e.path.join('.'),
                message: e.message
            }));

            const response = createErrorResponse('Validation failed', SystemMessageCode.VALIDATION_ERROR, 400, validationErrors, req.id);
            return res.status(response.statusCode).json(response);
        }

        // eslint-disable-next-line no-console
        console.error('Reset password error:', error);
        const response = createErrorResponse('Internal server error', SystemMessageCode.INTERNAL_SERVER_ERROR, 500, error.message, req.id);
        res.status(response.statusCode).json(response);
    }
};

export const verifyEmail = async (req: Request, res: Response) => {
    try {
        const { token } = verifyEmailSchema.parse(req.body);

        const verificationToken = await emailVerificationTokenRepository.findByToken(token);

        if (!verificationToken) {
            const response = createErrorResponse('Invalid or expired verification token', SystemMessageCode.AUTH_INVALID_TOKEN, 400, undefined, req.id);
            return res.status(response.statusCode).json(response);
        }

        if (verificationToken.expires < new Date()) {
            await emailVerificationTokenRepository.deleteToken(verificationToken.id);
            const response = createErrorResponse('Verification token has expired. Please request a new one.', SystemMessageCode.AUTH_TOKEN_EXPIRED, 400, undefined, req.id);
            return res.status(response.statusCode).json(response);
        }

        const user = await userRepository.findByEmail(verificationToken.email);

        if (!user) {
            const response = createErrorResponse('User not found', SystemMessageCode.AUTH_USER_NOT_FOUND, 400, undefined, req.id);
            return res.status(response.statusCode).json(response);
        }

        if (user.emailVerified) {
            const response = createErrorResponse('Email is already verified', SystemMessageCode.AUTH_EMAIL_ALREADY_VERIFIED, 400, undefined, req.id);
            return res.status(response.statusCode).json(response);
        }

        // Update user's emailVerified field
        await userRepository.verifyEmail(user.id);

        // Delete the used token
        await emailVerificationTokenRepository.deleteToken(verificationToken.id);

        // Delete all other verification tokens for this email
        await emailVerificationTokenRepository.deleteByEmail(verificationToken.email);

        const response = createSuccessResponse({}, 'Email verified successfully! You can now log in.', 200, { requestId: req.id }, SystemMessageCode.AUTH_EMAIL_VERIFIED);
        res.status(response.statusCode).json(response);

    } catch (error: any) {
        if (error instanceof z.ZodError) {
            const validationErrors = error.issues.map(e => ({
                field: e.path.join('.'),
                message: e.message
            }));

            const response = createErrorResponse('Validation failed', SystemMessageCode.VALIDATION_ERROR, 400, validationErrors, req.id);
            return res.status(response.statusCode).json(response);
        }

        // eslint-disable-next-line no-console
        console.error('Email verification error:', error);
        const response = createErrorResponse('Internal server error', SystemMessageCode.INTERNAL_SERVER_ERROR, 500, error.message, req.id);
        res.status(response.statusCode).json(response);
    }
};

export const resendVerificationEmail = async (req: Request, res: Response) => {
    try {
        const { email } = resendVerificationEmailSchema.parse(req.body);

        const user = await userRepository.findByEmail(email);

        if (!user) {
            // Return success even if user not found to prevent enumeration
            const response = createSuccessResponse({}, 'If an account exists with this email, a verification email has been sent.', 200, { requestId: req.id }, SystemMessageCode.AUTH_VERIFICATION_EMAIL_SENT);
            return res.status(response.statusCode).json(response);
        }

        if (user.emailVerified) {
            const response = createErrorResponse('Email is already verified', SystemMessageCode.AUTH_EMAIL_ALREADY_VERIFIED, 400, undefined, req.id);
            return res.status(response.statusCode).json(response);
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

        const response = createSuccessResponse({}, 'Verification email has been sent. Please check your inbox.', 200, { requestId: req.id }, SystemMessageCode.AUTH_VERIFICATION_EMAIL_SENT);
        res.status(response.statusCode).json(response);

    } catch (error: any) {
        if (error instanceof z.ZodError) {
            const validationErrors = error.issues.map(e => ({
                field: e.path.join('.'),
                message: e.message
            }));

            const response = createErrorResponse('Validation failed', SystemMessageCode.VALIDATION_ERROR, 400, validationErrors, req.id);
            return res.status(response.statusCode).json(response);
        }

        // eslint-disable-next-line no-console
        console.error('Resend verification error:', error);
        const response = createErrorResponse('Internal server error', SystemMessageCode.INTERNAL_SERVER_ERROR, 500, error.message, req.id);
        res.status(response.statusCode).json(response);
    }
};

export const logout = async (req: Request, res: Response) => {
    try {
        const { refreshToken } = req.body;

        if (refreshToken) {
            const session = await sessionRepository.findSession(refreshToken);
            if (session) {
                await sessionRepository.deleteSession(session.id);
            }
        }

        const response = createSuccessResponse({}, 'Logged out successfully', 200, { requestId: req.id }, SystemMessageCode.AUTH_LOGOUT_SUCCESS);
        res.status(response.statusCode).json(response);
    } catch (error: any) {
        // eslint-disable-next-line no-console
        console.error('Logout error:', error);
        const response = createErrorResponse('Internal server error', SystemMessageCode.INTERNAL_SERVER_ERROR, 500, error.message, req.id);
        res.status(response.statusCode).json(response);
    }
};
