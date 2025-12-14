import { Request, Response } from 'express';
import { createSuccessResponse, createErrorResponse, ErrorCode } from '@platform/contracts';
import { userRepository } from '@platform/db';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { z } from 'zod';
import { registerSchema } from '../validations/auth.validation';

dotenv.config({ path: '../../.env' });

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