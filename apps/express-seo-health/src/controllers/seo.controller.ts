import { Request, Response } from 'express';
import { z } from 'zod';
import { createSuccessResponse, createErrorResponse, createValidationErrorResponse, ErrorCode } from '@platform/contracts';
import { analyzeSEOHealth } from '../services/seo-analyzer.service';
// import { verifyToken } from '@platform/auth'; // Uncomment when @platform/auth is ready/linked

const analyzeSchema = z.object({
    url: z.string().url('Invalid URL format'),
});

export const analyzeSEO = async (req: Request, res: Response) => {
    const startTime = Date.now();
    const requestId = (req as any).id || crypto.randomUUID();
    
    try {
        // Validate input
        const validationResult = analyzeSchema.safeParse(req.body);

        if (!validationResult.success) {
            const errors = validationResult.error.flatten().fieldErrors;
            const response = createValidationErrorResponse(errors, requestId);
            return res.status(response.statusCode).json(response);
        }

        const { url } = validationResult.data;
        
        // eslint-disable-next-line no-console
        console.log(`[SEO Analysis] Starting analysis for: ${url}`);

        // Try to get User ID from header (Basic implementation)
        const userId: string | undefined = undefined;
        // const authHeader = req.headers.authorization;
        // if (authHeader && authHeader.startsWith('Bearer ')) {
        //     const token = authHeader.split(' ')[1];
        //     try {
        //         // const payload = verifyToken(token);
        //         // userId = payload.sub || payload.id;
        //     } catch (err) {
        //         console.warn('Invalid auth token provided, proceeding as anonymous');
        //     }
        // }

        // Perform SEO analysis
        const analysis = await analyzeSEOHealth(url, userId);
        
        const duration = Date.now() - startTime;
        // eslint-disable-next-line no-console
        console.log(`[SEO Analysis] Completed for ${url} in ${duration}ms - Score: ${analysis.healthScore}/100`);
        
        // Log the analysis
        logAnalysis(url, analysis.healthScore, req.ip || 'unknown', userId);

        const response = createSuccessResponse(
            analysis,
            'SEO analysis completed successfully',
            200,
            { requestId, duration }
        );
        
        res.status(response.statusCode).json(response);

    } catch (error: any) {
        const duration = Date.now() - startTime;
        // eslint-disable-next-line no-console
        console.error(`[SEO Analysis] Failed after ${duration}ms:`, error.message);
        
        const response = createErrorResponse(
            error.message || 'SEO analysis failed',
            ErrorCode.INTERNAL_SERVER_ERROR,
            500,
            process.env.NODE_ENV === 'development' ? error.stack : undefined,
            requestId
        );
        
        res.status(response.statusCode).json(response);
    }
};

function logAnalysis(url: string, score: number, ip: string, userId?: string) {
    // eslint-disable-next-line no-console
    console.log(`[Log] URL: ${url}, Score: ${score}, IP: ${ip}, User: ${userId || 'Anonymous'}, Timestamp: ${new Date().toISOString()}`);
}

