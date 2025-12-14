import { Request, Response } from 'express';
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
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await userRepository.createCustomer({
            email,
            password: hashedPassword,
            name: `${firstName} ${lastName}`,
        });

        res.status(201).json({ message: 'User created successfully', userId: user.id });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                message: 'Validation failed',
                errors: error.issues.map(e => ({
                    field: e.path.join('.'),
                    message: e.message
                }))
            });
        }

        console.error('Registration error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};