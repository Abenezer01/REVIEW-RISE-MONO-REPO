import { Request, Response } from 'express';
import { prisma } from '@platform/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import dotenv from 'dotenv';
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
                            connect: { id: "a7477029-bf31-4100-9b5b-78915742e451" },
                        },
                    },
                }
            },
        });

        res.status(201).json({ message: 'User created successfully', userId: user.id });
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