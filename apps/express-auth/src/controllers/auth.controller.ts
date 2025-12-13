import { Request, Response } from 'express';
import { prisma } from '@platform/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { sendVerificationEmail } from '../services/email.service';
dotenv.config({ path: '.env.example' });

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables");
}

export const register = async (req: Request, res: Response) => {
    const { email, password, firstName, lastName } = req.body;

    const missingFields = [];
    if (!email) missingFields.push("email");
    if (!password) missingFields.push("password");
    if (!firstName) missingFields.push("firstName");
    if (!lastName) missingFields.push("lastName");
    if (missingFields.length > 0) {
        return res.status(400).json({
            message: `Missing required fields: ${missingFields.join(", ")}`,
            missingFields
        });
    }

    try {
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name: `${firstName} ${lastName}`,
                userRoles: {
                    create: {
                        role: {
                            connect: { id: "2d95107a-7439-485e-9550-39058caf2013" },
                        },
                    },
                }
            },
        });

        // Generate verification token
        const verificationToken = crypto.randomUUID();
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours expiry

        // Save verification token to database
        await prisma.emailVerificationToken.create({
            data: {
                email,
                token: verificationToken,
                expires: expiresAt
            }
        });

        // Send verification email
        await sendVerificationEmail(email, verificationToken);

        res.status(201).json({
            message: 'User created successfully. Please check your email to verify your account.',
            userId: user.id
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { email },
            include: { userRoles: { include: { role: true } } }
        });

        if (!user || !user.password) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ message: 'Invalid credentials' });
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

        await prisma.session.create({
            data: {
                sessionToken: refreshToken,
                userId: user.id,
                expires: expiresAt,
            }
        });

        res.json({
            message: 'Login successful',
            accessToken,
            refreshToken
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const refreshToken = async (req: Request, res: Response) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(400).json({ message: 'Refresh token is required' });
    }

    try {
        const session = await prisma.session.findUnique({
            where: { sessionToken: refreshToken },
            include: { user: { include: { userRoles: { include: { role: true } } } } }
        });

        if (!session) {
            return res.status(401).json({ message: 'Invalid refresh token' });
        }

        if (session.expires < new Date()) {
            await prisma.session.delete({ where: { id: session.id } });
            return res.status(401).json({ message: 'Refresh token expired' });
        }

        const user = session.user;
        const newAccessToken = jwt.sign(
            { userId: user.id, email: user.email, roles: user.userRoles.map(ur => ur.role.name) },
            JWT_SECRET,
            { expiresIn: '15m' }
        );

        res.json({
            accessToken: newAccessToken
        });

    } catch (error) {
        console.error('Refresh token error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const forgotPassword = async (req: Request, res: Response) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: 'Email is required' });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            // Return success even if user not found to prevent enumeration
            return res.json({ message: 'A password reset email has been sent.' });
        }

        // Generate reset token
        const token = crypto.randomUUID();
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour expiry

        // Save token to database
        // Note: We might need to handle cleanup of old tokens or make sure email is unique in the reset token table if we want only one active token
        // For now, simple create is fine, or we could delete existing ones for this email first
        await prisma.passwordResetToken.create({
            data: {
                email,
                token,
                expires: expiresAt
            }
        });

        // Mock sending email
        console.log(`[MOCK EMAIL] Password reset token for ${email}: ${token}`);
        // In a real app: await sendEmail(user.email, "Password Reset", `Use this token: ${token}`);

        res.json({ message: 'A password reset email has been sent.' });

    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const resetPassword = async (req: Request, res: Response) => {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
        return res.status(400).json({ message: 'Token and new password are required' });
    }

    try {
        const resetToken = await prisma.passwordResetToken.findUnique({
            where: { token },
        });

        if (!resetToken) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        if (resetToken.expires < new Date()) {
            await prisma.passwordResetToken.delete({ where: { id: resetToken.id } });
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        const user = await prisma.user.findUnique({
            where: { email: resetToken.email }
        });

        if (!user) {
            return res.status(400).json({ message: 'User no longer exists' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
            where: { id: user.id },
            data: { password: hashedPassword }
        });

        // Delete the used token
        await prisma.passwordResetToken.delete({
            where: { id: resetToken.id }
        });

        // Optional: Delete all other tokens for this email?
        // await prisma.passwordResetToken.deleteMany({ where: { email: resetToken.email } });

        res.json({ message: 'Password reset successful' });

    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const verifyEmail = async (req: Request, res: Response) => {
    const { token } = req.body;

    if (!token) {
        return res.status(400).json({ message: 'Verification token is required' });
    }

    try {
        const verificationToken = await prisma.emailVerificationToken.findUnique({
            where: { token },
        });

        if (!verificationToken) {
            return res.status(400).json({ message: 'Invalid or expired verification token' });
        }

        if (verificationToken.expires < new Date()) {
            await prisma.emailVerificationToken.delete({ where: { id: verificationToken.id } });
            return res.status(400).json({ message: 'Verification token has expired. Please request a new one.' });
        }

        const user = await prisma.user.findUnique({
            where: { email: verificationToken.email }
        });

        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        if (user.emailVerified) {
            return res.status(400).json({ message: 'Email is already verified' });
        }

        // Update user's emailVerified field
        await prisma.user.update({
            where: { id: user.id },
            data: { emailVerified: new Date() }
        });

        // Delete the used token
        await prisma.emailVerificationToken.delete({
            where: { id: verificationToken.id }
        });

        // Delete all other verification tokens for this email
        await prisma.emailVerificationToken.deleteMany({
            where: { email: verificationToken.email }
        });

        res.json({ message: 'Email verified successfully! You can now log in.' });

    } catch (error) {
        console.error('Email verification error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const resendVerificationEmail = async (req: Request, res: Response) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: 'Email is required' });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            // Return success even if user not found to prevent enumeration
            return res.json({ message: 'If an account exists with this email, a verification email has been sent.' });
        }

        if (user.emailVerified) {
            return res.status(400).json({ message: 'Email is already verified' });
        }

        // Delete any existing verification tokens for this email
        await prisma.emailVerificationToken.deleteMany({
            where: { email }
        });

        // Generate new verification token
        const verificationToken = crypto.randomUUID();
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours expiry

        // Save verification token to database
        await prisma.emailVerificationToken.create({
            data: {
                email,
                token: verificationToken,
                expires: expiresAt
            }
        });

        // Send verification email
        await sendVerificationEmail(email, verificationToken);

        res.json({ message: 'Verification email has been sent. Please check your inbox.' });

    } catch (error) {
        console.error('Resend verification error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
