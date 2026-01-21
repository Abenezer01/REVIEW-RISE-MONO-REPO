import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface DecodedUser {
    id: string;
    email: string;
    role?: string;
}

declare global {
    namespace Express {
        interface Request {
            user?: DecodedUser;
        }
    }
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({ message: 'Authorization header missing' });
        }

        const token = authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: 'Token missing' });
        }

        const secret = process.env.JWT_SECRET;

        if (!secret) {
            console.error('JWT_SECRET not configured');
            return res.status(500).json({ message: 'Internal server error' });
        }

        const decoded = jwt.verify(token, secret) as DecodedUser;
        req.user = decoded;

        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
};

export const requireRole = (roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        if (req.user.role && roles.includes(req.user.role)) {
            next();
        } else {
            return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
        }
    };
};
