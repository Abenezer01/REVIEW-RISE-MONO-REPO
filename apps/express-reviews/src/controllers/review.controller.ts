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
        });

        return res.json(result);
    } catch (error: any) {
        console.error('Error in listReviews controller:', error);
        return res.status(500).json({ error: error.message || 'Internal server error' });
    }
};
