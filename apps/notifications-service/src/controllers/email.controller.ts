import { Request, Response } from 'express';
import { z } from 'zod';
import { createSuccessResponse, createErrorResponse, SystemMessageCode } from '@platform/contracts';
import { sendVerificationEmail } from '../services/email.service';

/**
 * Validation schema for verification email request
 */
const sendVerificationEmailSchema = z.object({
    email: z.string().email('Invalid email address'),
    token: z.string().min(1, 'Token is required'),
});

/**
 * Send verification email
 */
export const sendVerificationEmailHandler = async (req: Request, res: Response) => {
    try {
        // Validate request body
        const { email, token } = sendVerificationEmailSchema.parse(req.body);

        await sendVerificationEmail(email, token);

        const response = createSuccessResponse({}, 'Verification email sent successfully', 200, { requestId: req.id }, SystemMessageCode.AUTH_VERIFICATION_EMAIL_SENT);
        res.status(response.statusCode).json(response);
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            const validationErrors = error.issues.map(issue => ({
                field: issue.path.join('.'),
                message: issue.message
            }));

            const response = createErrorResponse('Validation failed', ErrorCode.BAD_REQUEST, 400, validationErrors, req.id);
            return res.status(response.statusCode).json(response);
        }

        console.error('Error sending verification email:', error);
        const response = createErrorResponse('Failed to send verification email', ErrorCode.INTERNAL_SERVER_ERROR, 500, error.message, req.id);
        res.status(response.statusCode).json(response);
    }
};
