import { Request, Response } from 'express';
import { createSuccessResponse, createErrorResponse } from '@platform/contracts';

export const getDashboardSummary = async (req: Request, res: Response) => {
    try {

        // Return structured data for phase 3 integration
        const data = {
            listingsAccuracy: 92,
            napStatus: 'Healthy' as const,
            missingCount: 3,
            // GBP Performance (P1)
            gbpImpressions: 14820,
            gbpSearches: 5310,
            gbpCalls: 284,
            gbpDirections: 193,
            gbpImpressionsDelta: 12,
            gbpCallsDelta: 8,
            // Weekly digest for listings (P1)
            weeklyDigest: {
                listingsChange: 2,
            },
            // Competitor benchmark (P3)
            competitor: {
                avgRating: 4.3,
                avgReviewCount: 87,
                avgSeoScore: 65,
            },
            // Locations (P3)
            locations: [
                { id: '1', name: 'Downtown HQ', address: '123 Main St, New York, NY', score: 84, napStatus: 'Healthy' as const, rating: 4.8 },
                { id: '2', name: 'West Side Branch', address: '456 Broadway, New York, NY', score: 67, napStatus: 'Warning' as const, rating: 4.4 },
            ],
            trends: [
                { date: 'Mon', listings: 85 },
                { date: 'Tue', listings: 88 },
                { date: 'Wed', listings: 88 },
                { date: 'Thu', listings: 90 },
                { date: 'Fri', listings: 92 },
                { date: 'Sat', listings: 92 },
                { date: 'Sun', listings: 92 },
            ],
            alerts: [
                { id: '1', type: 'Critical', message: 'Your hours differ on Google vs. Yelp', actionLabel: 'Fix Now' },
                { id: '2', type: 'QuickWin', message: 'Compress images on homepage (+8 score estimate)', actionLabel: 'View Details' },
            ]
        };

        const response = createSuccessResponse(
            data,
            'Dashboard summary retrieved successfully',
            200,
            { requestId: req.id },
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
