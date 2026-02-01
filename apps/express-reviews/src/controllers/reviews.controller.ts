import { Request, Response } from 'express';
import { createSuccessResponse, createErrorResponse, SystemMessageCode } from '@platform/contracts';
import { reviewSourceRepository, reviewRepository } from '@platform/db';
import { reviewSyncService } from '../services/review-sync.service';

export const listReviewSources = async (req: Request, res: Response) => {
    try {
        const { locationId } = req.params;

        const sources = await reviewSourceRepository.findByLocationId(locationId);

        // Sanitize secrets before returning
        const sanitizedSources = sources.map(source => ({
            id: source.id,
            locationId: source.locationId,
            platform: source.platform,
            status: source.status,
            createdAt: source.createdAt,
            updatedAt: source.updatedAt,
            // Exclude tokens
        }));

        const response = createSuccessResponse(sanitizedSources, 'Review sources fetched successfully', 200, { requestId: req.id }, SystemMessageCode.SUCCESS);
        res.status(response.statusCode).json(response);
    } catch (error: any) {
        console.error('List review sources error:', error);
        const response = createErrorResponse('Internal server error', SystemMessageCode.INTERNAL_SERVER_ERROR, 500, error.message, req.id);
        res.status(response.statusCode).json(response);
    }
};

export const listLocationReviews = async (req: Request, res: Response) => {
    try {
        const { locationId } = req.params;
        const reviews = await reviewRepository.findByLocationId(locationId);

        const response = createSuccessResponse(reviews, 'Reviews fetched successfully', 200, { requestId: req.id }, SystemMessageCode.SUCCESS);
        res.status(response.statusCode).json(response);
    } catch (error: any) {
        console.error('List reviews error:', error);
        const response = createErrorResponse('Internal server error', SystemMessageCode.INTERNAL_SERVER_ERROR, 500, error.message, req.id);
        res.status(response.statusCode).json(response);
    }
};

export const disconnectReviewSource = async (req: Request, res: Response) => {
    try {
        const { id } = req.params; // review source id

        // Soft delete? For now, we can update status to 'disconnected' or delete
        // If we delete, we might lose history. Let's update status.
        // But schema says deletedAt is not on ReviewSource. 
        // Let's delete it for now to allow re-connection cleanly, or introduce status update.
        await reviewSourceRepository.delete(id);

        const response = createSuccessResponse({}, 'Review source disconnected successfully', 200, { requestId: req.id }, SystemMessageCode.REVIEWS_SOURCE_DISCONNECTED);
        res.status(response.statusCode).json(response);
    } catch (error: any) {
        console.error('Disconnect review source error:', error);
        const response = createErrorResponse('Internal server error', SystemMessageCode.INTERNAL_SERVER_ERROR, 500, error.message, req.id);
        res.status(response.statusCode).json(response);
    }
};


export const getReviewStats = async (req: Request, res: Response) => {
    try {
        const { locationId } = req.params;
        const reviews = await reviewRepository.findByLocationId(locationId);
        
        const totalReviews = reviews.length;
        const averageRating = totalReviews > 0 
            ? reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / totalReviews 
            : 0;

        const response = createSuccessResponse({
            totalReviews,
            averageRating: Number(averageRating.toFixed(1)),
            platforms: ['google', 'yelp'] // Mock or derive from sources
        }, 'Review stats fetched successfully', 200, { requestId: req.id }, SystemMessageCode.SUCCESS);
        res.status(response.statusCode).json(response);
    } catch (error: any) {
        console.error('Get review stats error:', error);
        const response = createErrorResponse('Internal server error', SystemMessageCode.INTERNAL_SERVER_ERROR, 500, error.message, req.id);
        res.status(response.statusCode).json(response);
    }
};

export const syncReviews = async (req: Request, res: Response) => {
    try {
        const { locationId } = req.params;

        // Trigger sync in background or await? 
        // For UI feedback, awaiting is better if fast, but sync can be slow.
        // Let's await for now as MVP.
        const results = await reviewSyncService.syncReviewsForLocation(locationId);

        const response = createSuccessResponse(results, 'Sync completed', 200, { requestId: req.id }, SystemMessageCode.REVIEWS_SYNC_COMPLETED);
        res.status(response.statusCode).json(response);
    } catch (error: any) {
        console.error('Sync reviews error:', error);
        const response = createErrorResponse('Internal server error', SystemMessageCode.INTERNAL_SERVER_ERROR, 500, error.message, req.id);
        res.status(response.statusCode).json(response);
    }
};

export const getLocationKeywords = async (req: Request, res: Response) => {
    try {
        const { locationId } = req.params;
        const { timeRange = '30d' } = req.query;

        // Calculate date range
        const now = new Date();
        const startDate = new Date();
        
        switch (timeRange) {
            case '7d':
                startDate.setDate(now.getDate() - 7);
                break;
            case '90d':
                startDate.setDate(now.getDate() - 90);
                break;
            case '30d':
            default:
                startDate.setDate(now.getDate() - 30);
                break;
        }

        // Fetch reviews in the time range
        const reviews = await reviewRepository.findMany({
            where: {
                locationId,
                publishedAt: {
                    gte: startDate
                }
            }
        });

        // Aggregate keywords from tags
        const keywordCounts = new Map<string, number>();
        
        reviews.forEach(review => {
            review.tags.forEach(tag => {
                const count = keywordCounts.get(tag) || 0;
                keywordCounts.set(tag, count + 1);
            });
        });

        // Convert to array and sort by count
        const keywords = Array.from(keywordCounts.entries())
            .map(([keyword, count]) => ({ keyword, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 20); // Top 20 keywords

        const response = createSuccessResponse({ keywords }, 'Keywords fetched successfully', 200, { requestId: req.id }, SystemMessageCode.SUCCESS);
        res.status(response.statusCode).json(response);
    } catch (error: any) {
        console.error('Get location keywords error:', error);
        const response = createErrorResponse('Internal server error', SystemMessageCode.INTERNAL_SERVER_ERROR, 500, error.message, req.id);
        res.status(response.statusCode).json(response);
    }
};
