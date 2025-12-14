import { Request, Response } from 'express';
import { createSuccessResponse, createErrorResponse, ErrorCode } from '@platform/contracts';
import { userRepository, sessionRepository } from '@platform/db';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { registerSchema } from '../validations/auth.validation';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import dotenv from 'dotenv';
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