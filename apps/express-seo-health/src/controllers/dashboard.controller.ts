import { Request, Response } from 'express';
import { createSuccessResponse, createErrorResponse } from '@platform/contracts';

export const getDashboardSummary = async (req: Request, res: Response) => {
    try {

        // Return structured mock data for phase 3 integration
        const data = {
            seoScore: 78,
            seoFixes: ['Missing H1 tags (3 pages)', 'Slow mobile speed (2.4s)', 'Broken internal links (7)'],
            trends: [
                { date: 'Mon', seo: 65 },
                { date: 'Tue', seo: 68 },
                { date: 'Wed', seo: 72 },
                { date: 'Thu', seo: 75 },
                { date: 'Fri', seo: 78 },
                { date: 'Sat', seo: 78 },
                { date: 'Sun', seo: 78 },
            ],
            weeklyDigest: {
                seoChange: 3,
            }
        };

        const response = createSuccessResponse(
            data,
            'Dashboard summary retrieved successfully',
            200,
            { requestId: req.id },
            // Using a generic success code or casting bypass
            'SUCCESS' as any
        );

        res.status(response.statusCode).json(response);
    } catch (error: any) {
        const response = createErrorResponse(
            error.message || 'Failed to retrieve dashboard summary',
            'INTERNAL_SERVER_ERROR' as any,
            500,
            process.env.NODE_ENV === 'development' ? error.stack : undefined,
            req.id
        );
        res.status(response.statusCode).json(response);
    }
};
