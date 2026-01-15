import { Request, Response } from 'express';
import { createSuccessResponse, createErrorResponse, ErrorCode } from '@platform/contracts';
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

        res.status(200).json(
            createSuccessResponse(sanitizedSources, 'Review sources fetched successfully')
        );
    } catch (error) {
        console.error('List review sources error:', error);
        res.status(500).json(
            createErrorResponse('Internal server error', ErrorCode.INTERNAL_SERVER_ERROR, 500)
        );
    }
};

export const listLocationReviews = async (req: Request, res: Response) => {
    try {
        const { locationId } = req.params;
        const reviews = await reviewRepository.findByLocationId(locationId);

        res.status(200).json(
            createSuccessResponse(reviews, 'Reviews fetched successfully')
        );
    } catch (error) {
        console.error('List reviews error:', error);
        res.status(500).json(
            createErrorResponse('Internal server error', ErrorCode.INTERNAL_SERVER_ERROR, 500)
        );
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

        res.status(200).json(
            createSuccessResponse({}, 'Review source disconnected successfully')
        );
    } catch (error) {
        console.error('Disconnect review source error:', error);
        res.status(500).json(
            createErrorResponse('Internal server error', ErrorCode.INTERNAL_SERVER_ERROR, 500)
        );
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

        res.status(200).json(
            createSuccessResponse({
                totalReviews,
                averageRating: Number(averageRating.toFixed(1)),
                platforms: ['google', 'yelp'] // Mock or derive from sources
            }, 'Review stats fetched successfully')
        );
    } catch (error) {
        console.error('Get review stats error:', error);
        res.status(500).json(
            createErrorResponse('Internal server error', ErrorCode.INTERNAL_SERVER_ERROR, 500)
        );
    }
};

export const syncReviews = async (req: Request, res: Response) => {
    try {
        const { locationId } = req.params;

        // Trigger sync in background or await? 
        // For UI feedback, awaiting is better if fast, but sync can be slow.
        // Let's await for now as MVP.
        const results = await reviewSyncService.syncReviewsForLocation(locationId);

        res.status(200).json(
            createSuccessResponse(results, 'Sync completed')
        );
    } catch (error) {
        console.error('Sync reviews error:', error);
        res.status(500).json(
            createErrorResponse('Internal server error', ErrorCode.INTERNAL_SERVER_ERROR, 500)
        );
    }
};

