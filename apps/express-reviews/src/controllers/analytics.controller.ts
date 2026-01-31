import { Request, Response } from 'express';
import { createSuccessResponse, createErrorResponse, ErrorCode } from '@platform/contracts';
import { reviewRepository, competitorReviewRepository } from '@platform/db';

/**
 * Get sentiment analysis overview
 * @route GET /api/v1/reviews/analytics/sentiment
 */
export const getSentimentOverview = async (req: Request, res: Response) => {
    try {
        const { locationId, businessId, period = '30' } = req.query;

        if (!businessId || typeof businessId !== 'string') {
            const errorResponse = createErrorResponse('businessId is required', ErrorCode.VALIDATION_ERROR, 400, undefined, req.id);
            return res.status(errorResponse.statusCode).json(errorResponse);
        }

        const periodDays = parseInt(period as string, 10);
        
        const sentimentData = await reviewRepository.getSentimentStats({
            businessId,
            locationId: locationId as string | undefined,
            periodDays
        });

        const response = createSuccessResponse(sentimentData, 'Sentiment overview fetched successfully', 200, { requestId: req.id });
        res.status(response.statusCode).json(response);
    } catch (error: any) {
        console.error('Get sentiment overview error:', error);
        const response = createErrorResponse('Internal server error', ErrorCode.INTERNAL_SERVER_ERROR, 500, error.message, req.id);
        res.status(response.statusCode).json(response);
    }
};

/**
 * Get recent review summary using AI (mocked logic or delegated to AI service)
 * @route GET /api/v1/reviews/analytics/summary
 */
export const getRecentSummary = async (req: Request, res: Response) => {
    try {
        const { locationId, businessId, limit = '5' } = req.query;

        if (!businessId || typeof businessId !== 'string') {
            const errorResponse = createErrorResponse('businessId is required', ErrorCode.VALIDATION_ERROR, 400, undefined, req.id);
            return res.status(errorResponse.statusCode).json(errorResponse);
        }

        const limitNum = parseInt(limit as string, 10);

        const summaryData = await reviewRepository.getReviewSummary({
            businessId,
            locationId: locationId as string | undefined,
            limit: limitNum
        });

        const response = createSuccessResponse(summaryData, 'Recent summary fetched successfully', 200, { requestId: req.id });
        res.status(response.statusCode).json(response);
    } catch (error: any) {
        console.error('Get recent summary error:', error);
        const response = createErrorResponse('Internal server error', ErrorCode.INTERNAL_SERVER_ERROR, 500, error.message, req.id);
        res.status(response.statusCode).json(response);
    }
};

/**
 * Get competitor comparison data
 * @route GET /api/v1/reviews/analytics/competitor-comparison
 */
export const getCompetitorComparison = async (req: Request, res: Response) => {
    try {
        const { locationId, businessId } = req.query;

        if (!businessId || typeof businessId !== 'string') {
            const errorResponse = createErrorResponse('businessId is required', ErrorCode.VALIDATION_ERROR, 400, undefined, req.id);
            return res.status(errorResponse.statusCode).json(errorResponse);
        }

        // Get competitor data
        const competitorData = await competitorReviewRepository.getLatestComparison(
            businessId,
            locationId as string | undefined
        );

        // Get business's own stats for comparison
        const businessReviews = await reviewRepository.findByBusinessId(businessId);
        const totalReviews = businessReviews.length;
        const averageRating = totalReviews > 0
            ? businessReviews.reduce((acc, r) => acc + (r.rating || 0), 0) / totalReviews
            : 0;

        const comparisonData = {
            business: {
                name: 'Your Business', // This could be fetched from business table
                averageRating: Number(averageRating.toFixed(2)),
                totalReviews
            },
            competitors: competitorData.map(comp => ({
                name: comp.competitorName,
                averageRating: comp.averageRating,
                totalReviews: comp.totalReviews,
                source: comp.source,
                capturedAt: comp.capturedAt
            }))
        };

        const response = createSuccessResponse(comparisonData, 'Competitor comparison fetched successfully', 200, { requestId: req.id });
        res.status(response.statusCode).json(response);
    } catch (error: any) {
        console.error('Get competitor comparison error:', error);
        const response = createErrorResponse('Internal server error', ErrorCode.INTERNAL_SERVER_ERROR, 500, error.message, req.id);
        res.status(response.statusCode).json(response);
    }
};
/**
 * Add or update competitor data
 * @route POST /api/v1/reviews/analytics/competitors
 */
export const addCompetitorData = async (req: Request, res: Response) => {
    try {
        const { businessId, locationId, competitorName, averageRating, totalReviews, source = 'manual' } = req.body;

        if (!businessId || !competitorName) {
            const errorResponse = createErrorResponse('businessId and competitorName are required', ErrorCode.VALIDATION_ERROR, 400, undefined, req.id);
            return res.status(errorResponse.statusCode).json(errorResponse);
        }

        const newCompetitorReview = await competitorReviewRepository.upsertCompetitorData({
            businessId,
            locationId,
            competitorName,
            averageRating: Number(averageRating),
            totalReviews: Number(totalReviews),
            source
        });

        const response = createSuccessResponse(newCompetitorReview, 'Competitor data added successfully', 201, { requestId: req.id });
        res.status(response.statusCode).json(response);
    } catch (error: any) {
        console.error('Add competitor data error:', error);
        const response = createErrorResponse('Internal server error', ErrorCode.INTERNAL_SERVER_ERROR, 500, error.message, req.id);
        res.status(response.statusCode).json(response);
    }
};

/**
 * Get dashboard card metrics
 * @route GET /api/v1/reviews/analytics/metrics
 */
export const getDashboardMetrics = async (req: Request, res: Response) => {
    try {
        const { locationId, businessId, period = '30' } = req.query;

        if (!businessId || typeof businessId !== 'string') {
            const errorResponse = createErrorResponse('businessId is required', ErrorCode.VALIDATION_ERROR, 400, undefined, req.id);
            return res.status(errorResponse.statusCode).json(errorResponse);
        }

        const periodDays = parseInt(period as string, 10);

        const metrics = await reviewRepository.getDashboardMetrics({
            businessId,
            locationId: locationId as string | undefined,
            periodDays
        });

        const calculateChange = (current: number, previous: number) => {
            if (previous === 0) return current > 0 ? 100 : 0;
            return ((current - previous) / previous) * 100;
        };

        const responseData = {
            ...metrics.current,
            previous: metrics.previous,
            changes: {
                totalReviews: calculateChange(metrics.current.totalReviews, metrics.previous.totalReviews),
                averageRating: calculateChange(metrics.current.averageRating, metrics.previous.averageRating),
                responseCount: calculateChange(metrics.current.responseCount, metrics.previous.responseCount),
                positiveSentiment: metrics.current.positiveSentiment - metrics.previous.positiveSentiment // Percentage point difference
            }
        };

        const response = createSuccessResponse(responseData, 'Dashboard metrics fetched successfully', 200, { requestId: req.id });
        res.status(response.statusCode).json(response);
    } catch (error: any) {
        console.error('Get dashboard metrics error:', error);
        const response = createErrorResponse('Internal server error', ErrorCode.INTERNAL_SERVER_ERROR, 500, error.message, req.id);
        res.status(response.statusCode).json(response);
    }
};
