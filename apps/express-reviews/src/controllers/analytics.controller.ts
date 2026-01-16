import { Request, Response } from 'express';
import { createSuccessResponse, createErrorResponse, ErrorCode } from '@platform/contracts';
import { reviewRepository, competitorReviewRepository } from '@platform/db';

/**
 * Get rating trend over time
 * @route GET /api/v1/reviews/analytics/rating-trend
 */
export const getRatingTrend = async (req: Request, res: Response) => {
    try {
        const { locationId, businessId, period = '30' } = req.query;

        if (!businessId || typeof businessId !== 'string') {
            return res.status(400).json(
                createErrorResponse('businessId is required', ErrorCode.VALIDATION_ERROR, 400)
            );
        }

        const periodDays = parseInt(period as string, 10);
        
        const trendData = await reviewRepository.getRatingTrend({
            businessId,
            locationId: locationId as string | undefined,
            periodDays
        });

        res.status(200).json(
            createSuccessResponse(trendData, 'Rating trend fetched successfully')
        );
    } catch (error) {
        console.error('Get rating trend error:', error);
        res.status(500).json(
            createErrorResponse('Internal server error', ErrorCode.INTERNAL_SERVER_ERROR, 500)
        );
    }
};

/**
 * Get review volume by source over time
 * @route GET /api/v1/reviews/analytics/volume
 */
export const getReviewVolume = async (req: Request, res: Response) => {
    try {
        const { locationId, businessId, period = '30' } = req.query;

        if (!businessId || typeof businessId !== 'string') {
            return res.status(400).json(
                createErrorResponse('businessId is required', ErrorCode.VALIDATION_ERROR, 400)
            );
        }

        const periodDays = parseInt(period as string, 10);

        const volumeData = await reviewRepository.getVolumeBySource({
            businessId,
            locationId: locationId as string | undefined,
            periodDays
        });

        res.status(200).json(
            createSuccessResponse(volumeData, 'Review volume fetched successfully')
        );
    } catch (error) {
        console.error('Get review volume error:', error);
        res.status(500).json(
            createErrorResponse('Internal server error', ErrorCode.INTERNAL_SERVER_ERROR, 500)
        );
    }
};

/**
 * Get sentiment heatmap data
 * @route GET /api/v1/reviews/analytics/sentiment
 */
export const getSentimentHeatmap = async (req: Request, res: Response) => {
    try {
        const { locationId, businessId, period = '30', groupBy = 'day' } = req.query;

        if (!businessId || typeof businessId !== 'string') {
            return res.status(400).json(
                createErrorResponse('businessId is required', ErrorCode.VALIDATION_ERROR, 400)
            );
        }

        if (groupBy !== 'day' && groupBy !== 'week') {
            return res.status(400).json(
                createErrorResponse('groupBy must be either "day" or "week"', ErrorCode.VALIDATION_ERROR, 400)
            );
        }

        const periodDays = parseInt(period as string, 10);

        const sentimentData = await reviewRepository.getSentimentHeatmap({
            businessId,
            locationId: locationId as string | undefined,
            periodDays,
            groupBy: groupBy as 'day' | 'week'
        });

        res.status(200).json(
            createSuccessResponse(sentimentData, 'Sentiment heatmap fetched successfully')
        );
    } catch (error) {
        console.error('Get sentiment heatmap error:', error);
        res.status(500).json(
            createErrorResponse('Internal server error', ErrorCode.INTERNAL_SERVER_ERROR, 500)
        );
    }
};

/**
 * Get top keywords from reviews
 * @route GET /api/v1/reviews/analytics/keywords
 */
export const getTopKeywords = async (req: Request, res: Response) => {
    try {
        const { locationId, businessId, limit = '20' } = req.query;

        if (!businessId || typeof businessId !== 'string') {
            return res.status(400).json(
                createErrorResponse('businessId is required', ErrorCode.VALIDATION_ERROR, 400)
            );
        }

        const limitNum = parseInt(limit as string, 10);

        const keywordsData = await reviewRepository.getTopKeywords({
            businessId,
            locationId: locationId as string | undefined,
            limit: limitNum
        });

        res.status(200).json(
            createSuccessResponse(keywordsData, 'Keywords fetched successfully')
        );
    } catch (error) {
        console.error('Get keywords error:', error);
        res.status(500).json(
            createErrorResponse('Internal server error', ErrorCode.INTERNAL_SERVER_ERROR, 500)
        );
    }
};

/**
 * Get recent reviews summary
 * @route GET /api/v1/reviews/analytics/summary
 */
export const getRecentSummary = async (req: Request, res: Response) => {
    try {
        const { locationId, businessId, limit = '10' } = req.query;

        if (!businessId || typeof businessId !== 'string') {
            return res.status(400).json(
                createErrorResponse('businessId is required', ErrorCode.VALIDATION_ERROR, 400)
            );
        }

        const limitNum = parseInt(limit as string, 10);

        const summaryData = await reviewRepository.getRecentSummary({
            businessId,
            locationId: locationId as string | undefined,
            limit: limitNum
        });

        res.status(200).json(
            createSuccessResponse(summaryData, 'Recent summary fetched successfully')
        );
    } catch (error) {
        console.error('Get recent summary error:', error);
        res.status(500).json(
            createErrorResponse('Internal server error', ErrorCode.INTERNAL_SERVER_ERROR, 500)
        );
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
            return res.status(400).json(
                createErrorResponse('businessId is required', ErrorCode.VALIDATION_ERROR, 400)
            );
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

        res.status(200).json(
            createSuccessResponse(comparisonData, 'Competitor comparison fetched successfully')
        );
    } catch (error) {
        console.error('Get competitor comparison error:', error);
        res.status(500).json(
            createErrorResponse('Internal server error', ErrorCode.INTERNAL_SERVER_ERROR, 500)
        );
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
            return res.status(400).json(
                createErrorResponse('businessId and competitorName are required', ErrorCode.VALIDATION_ERROR, 400)
            );
        }

        const newCompetitorReview = await competitorReviewRepository.upsertCompetitorData({
            businessId,
            locationId,
            competitorName,
            averageRating: Number(averageRating),
            totalReviews: Number(totalReviews),
            source
        });

        res.status(201).json(
            createSuccessResponse(newCompetitorReview, 'Competitor data added successfully')
        );
    } catch (error) {
        console.error('Add competitor data error:', error);
        res.status(500).json(
            createErrorResponse('Internal server error', ErrorCode.INTERNAL_SERVER_ERROR, 500)
        );
    }
};
