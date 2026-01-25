import { Request, Response } from 'express';
import * as reviewService from '../services/review.service';
import { createSuccessResponse, createErrorResponse, ErrorCode } from '@platform/contracts';

export const listReviews = async (req: Request, res: Response) => {
    const requestId = req.id;
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
            return res.status(400).json(createErrorResponse('locationId is required', ErrorCode.VALIDATION_ERROR, 400, undefined, requestId));
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

        return res.json(createSuccessResponse(result, 'Reviews fetched successfully', 200, { requestId }));
    } catch (error: any) {
        console.error('Error in listReviews controller:', error);
        return res.status(500).json(createErrorResponse(error.message || 'Internal server error', ErrorCode.INTERNAL_SERVER_ERROR, 500, undefined, requestId));
    }
};

export const postReply = async (req: Request, res: Response) => {
    const requestId = req.id;
    try {
        const { reviewId } = req.params;
        const { comment, authorType, sourceType, userId } = req.body;

        if (!reviewId || !comment) {
            return res.status(400).json(createErrorResponse('reviewId and comment are required', ErrorCode.VALIDATION_ERROR, 400, undefined, requestId));
        }

        const result = await reviewService.postReviewReply(reviewId, comment, {
            authorType,
            sourceType,
            userId
        });
        return res.json(createSuccessResponse(result, 'Reply posted successfully', 200, { requestId }));
    } catch (error: any) {
        console.error('Error in postReply controller:', error);
        return res.status(500).json(createErrorResponse(error.message || 'Internal server error', ErrorCode.INTERNAL_SERVER_ERROR, 500, undefined, requestId));
    }
};

export const rejectReply = async (req: Request, res: Response) => {
    const requestId = req.id;
    try {
        const { reviewId } = req.params;

        if (!reviewId) {
            return res.status(400).json(createErrorResponse('reviewId is required', ErrorCode.VALIDATION_ERROR, 400, undefined, requestId));
        }

        const result = await reviewService.rejectReviewReply(reviewId);
        return res.json(createSuccessResponse(result, 'Reply rejected successfully', 200, { requestId }));
    } catch (error: any) {
        console.error('Error in rejectReply controller:', error);
        return res.status(500).json(createErrorResponse(error.message || 'Internal server error', ErrorCode.INTERNAL_SERVER_ERROR, 500, undefined, requestId));
    }
};
