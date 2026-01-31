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
import { register, login, refreshToken, forgotPassword, resetPassword, verifyEmail, resendVerificationEmail, me, logout } from '../../controllers/auth.controller';
import { validateRequest } from '@platform/middleware';
import { LoginRequestSchema, RegisterRequestSchema, ForgotPasswordRequestSchema, ResetPasswordRequestSchema, RefreshTokenRequestSchema } from '@platform/contracts';

const router = Router();

router.post('/register', createUserLimiter, validateRequest(RegisterRequestSchema), register);
router.post('/login', loginAttemptLimiter, validateRequest(LoginRequestSchema), login);
router.post('/refresh-token', refreshTokenLimiter, validateRequest(RefreshTokenRequestSchema), refreshToken);
router.post('/forgot-password', forgotPasswordLimiter, validateRequest(ForgotPasswordRequestSchema), forgotPassword);
router.post('/reset-password', passwordResetLimiter, validateRequest(ResetPasswordRequestSchema), resetPassword);
router.post('/verify-email', verifyEmailLimiter, verifyEmail);
router.post('/resend-verification', resendVerificationEmailLimiter, resendVerificationEmail);
router.post('/logout', loginAttemptLimiter, logout);
router.get('/me', me);

export default router;
