import { Request, Response } from 'express';
import * as reviewService from '../services/review.service';

export const listReviews = async (req: Request, res: Response) => {
    try {
        const { locationId } = req.params;
        const {
            page,
            limit,
            platform,
            rating,
            startDate,
            endDate,
            sentiment,
            replyStatus,
        } = req.query;

        if (!locationId) {
            return res.status(400).json({ error: 'locationId is required' });
        }

        const result = await reviewService.listReviewsByLocation({
            locationId,
            page: page ? parseInt(page as string, 10) : undefined,
            limit: limit ? parseInt(limit as string, 10) : undefined,
            platform: platform as string,
            rating: rating ? parseInt(rating as string, 10) : undefined,
            startDate: startDate as string,
            endDate: endDate as string,
            sentiment: sentiment as string,
            replyStatus: replyStatus as string,
        });

        return res.json(result);
    } catch (error: any) {
        console.error('Error in listReviews controller:', error);
        return res.status(500).json({ error: error.message || 'Internal server error' });
    }
};

export const postReply = async (req: Request, res: Response) => {
    try {
        const { reviewId } = req.params;
        const { comment } = req.body;

        if (!reviewId || !comment) {
            return res.status(400).json({ error: 'reviewId and comment are required' });
        }

        const result = await reviewService.postReviewReply(reviewId, comment);
        return res.json(result);
    } catch (error: any) {
        console.error('Error in postReply controller:', error);
        return res.status(500).json({ error: error.message || 'Internal server error' });
    }
};

export const rejectReply = async (req: Request, res: Response) => {
    try {
        const { reviewId } = req.params;

        if (!reviewId) {
            return res.status(400).json({ error: 'reviewId is required' });
        }

        const result = await reviewService.rejectReviewReply(reviewId);
        return res.json(result);
    } catch (error: any) {
        console.error('Error in rejectReply controller:', error);
        return res.status(500).json({ error: error.message || 'Internal server error' });
    }
};
