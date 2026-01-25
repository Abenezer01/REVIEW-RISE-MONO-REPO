import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

export const requestIdMiddleware = (req: Request, res: Response, next: NextFunction) => {
    req.id = (req.headers['x-request-id'] as string) || randomUUID();
    res.setHeader('x-request-id', req.id);
    next();
};

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Express {
        interface Request {
            id: string;
        }
    }
}
