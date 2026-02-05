import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface DecodedUser {
    userId: string;
    email: string;
    roles?: string[] | Record<string, string[]>;
}

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
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

        const secret = process.env.JWT_SECRET || 'super-secret-key-change-me';
        
        try {
            const decoded = jwt.verify(token, secret) as DecodedUser;
            req.user = decoded;
            next();
        } catch (jwtError: any) {
            console.error('[AuthMiddleware] JWT Verification failed:', jwtError.message);
            return res.status(401).json({ message: 'Invalid or expired token' });
        }
    } catch (error) {
        console.error('[AuthMiddleware] Unexpected error:', error);
        return res.status(401).json({ message: 'Internal server error during authentication' });
    }
};
