import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import type { Request, Response } from 'express';

const loginKeyGenerator = (req: Request, _res: Response): string => {
    const ip = req.ip ? ipKeyGenerator(req.ip) : '';
    const email = (req.body && typeof req.body.email === 'string') ? req.body.email : '';
    return ip + email;
};

// POST /login: IP + email, Max 5 attempts / 15 min per combo
export const loginAttemptLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,
    message: { error: 'Too many login attempts with this email from this IP, please try again after 15 minutes' },
    keyGenerator: loginKeyGenerator,
    standardHeaders: true,
    legacyHeaders: false,
});

// POST /: IP, Max 3 registrations / hour
export const createUserLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3,
    message: { error: 'Too many accounts created from this IP, please try again after an hour' },
    standardHeaders: true,
    legacyHeaders: false,
});

// POST /password-reset/*: IP + token, Max 5 / hour per token
const passwordResetKeyGenerator = (req: Request, _res: Response): string => {
    const ip = req.ip ? ipKeyGenerator(req.ip) : ''
    const token =
        typeof req.body?.token === 'string' ? req.body.token : ''
    return `${ip}:${token}`
}

export const passwordResetLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5,
    message: { error: 'Too many password reset requests, please try again after an hour' },
    keyGenerator: passwordResetKeyGenerator,
    standardHeaders: true,
    legacyHeaders: false,
});

// POST /forgot-password: IP + email, Max 3 / hour
export const forgotPasswordLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3,
    message: { error: 'Too many forgot password requests, please try again after an hour' },
    keyGenerator: loginKeyGenerator, // Re-use loginKeyGenerator (IP + email)
    standardHeaders: true,
    legacyHeaders: false,
});

// POST /refresh: Token / IP, Max 60 / hour
export const refreshTokenLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 60,
    message: { error: 'Too many refresh requests, please try again after an hour' },
    standardHeaders: true,
    legacyHeaders: false,
});

// POST /verify-email: IP + token, Max 5 requests / hour per token
const verifyEmailKeyGenerator = (req: Request, _res: Response): string => {
    const ip = req.ip ? ipKeyGenerator(req.ip) : ''
    const token =
        typeof req.body?.token === 'string' ? req.body.token : ''
    return `${ip}:${token}`
}

export const verifyEmailLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5,
    message: { error: 'Too many verification attempts, please try again after an hour' },
    keyGenerator: verifyEmailKeyGenerator,
    standardHeaders: true,
    legacyHeaders: false,
});

// POST /resend-verification: IP + email, Max 3 requests / hour
export const resendVerificationEmailLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3,
    message: { error: 'Too many resend verification requests, please try again after an hour' },
    keyGenerator: loginKeyGenerator, // Re-use loginKeyGenerator (IP + email)
    standardHeaders: true,
    legacyHeaders: false,
});

// Any /auth/*: IP global, Max 100 requests / 15 min per IP
export const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: { error: 'Too many requests from this IP, please try again after 15 minutes' },
    standardHeaders: true,
    legacyHeaders: false,
});