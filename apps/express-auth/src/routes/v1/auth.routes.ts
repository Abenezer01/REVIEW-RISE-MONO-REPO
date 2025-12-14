import { Router } from 'express';
import {
    loginAttemptLimiter,
    createUserLimiter,
    passwordResetLimiter,
    refreshTokenLimiter,
    forgotPasswordLimiter,
    verifyEmailLimiter,
    resendVerificationEmailLimiter,
} from '../../middleware/rateLimiter';
import { register, login, refreshToken, forgotPassword, resetPassword, verifyEmail, resendVerificationEmail } from '../../controllers/auth.controller';

const router = Router();

router.post('/register', createUserLimiter, register);
router.post('/login', loginAttemptLimiter, login);
router.post('/refresh-token', refreshTokenLimiter, refreshToken);
router.post('/forgot-password', forgotPasswordLimiter, forgotPassword);
router.post('/reset-password', passwordResetLimiter, resetPassword);
router.post('/verify-email', verifyEmailLimiter, verifyEmail);
router.post('/resend-verification', resendVerificationEmailLimiter, resendVerificationEmail);

export default router;
