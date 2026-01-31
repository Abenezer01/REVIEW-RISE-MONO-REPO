import { Request, Response } from 'express';
import * as reviewService from '../services/review.service';
import { createSuccessResponse, createErrorResponse, ErrorCode } from '@platform/contracts';

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
            const errorResponse = createErrorResponse('locationId is required', ErrorCode.BAD_REQUEST, 400, undefined, req.id);
            return res.status(errorResponse.statusCode).json(errorResponse);
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

        const successResponse = createSuccessResponse(result, 'Reviews fetched successfully', 200, { requestId: req.id });
        return res.status(successResponse.statusCode).json(successResponse);
    } catch (error: any) {
        console.error('Error in listReviews controller:', error);
        const errorResponse = createErrorResponse(error.message || 'Internal server error', ErrorCode.INTERNAL_SERVER_ERROR, 500, undefined, req.id);
        return res.status(errorResponse.statusCode).json(errorResponse);
    }
};

export const postReply = async (req: Request, res: Response) => {
    try {
        const { reviewId } = req.params;
        const { comment, authorType, sourceType, userId } = req.body;

        if (!reviewId || !comment) {
            const errorResponse = createErrorResponse('reviewId and comment are required', ErrorCode.BAD_REQUEST, 400, undefined, req.id);
            return res.status(errorResponse.statusCode).json(errorResponse);
        }

        const result = await reviewService.postReviewReply(reviewId, comment, {
            authorType,
            sourceType,
            userId
        });
        const successResponse = createSuccessResponse(result, 'Reply posted successfully', 200, { requestId: req.id });
        return res.status(successResponse.statusCode).json(successResponse);
    } catch (error: any) {
        console.error('Error in postReply controller:', error);
        const errorResponse = createErrorResponse(error.message || 'Internal server error', ErrorCode.INTERNAL_SERVER_ERROR, 500, undefined, req.id);
        return res.status(errorResponse.statusCode).json(errorResponse);
    }
};

export const rejectReply = async (req: Request, res: Response) => {
    try {
        const { reviewId } = req.params;

        if (!reviewId) {
            const errorResponse = createErrorResponse('reviewId is required', ErrorCode.BAD_REQUEST, 400, undefined, req.id);
            return res.status(errorResponse.statusCode).json(errorResponse);
        }

        const result = await reviewService.rejectReviewReply(reviewId);
        const successResponse = createSuccessResponse(result, 'Reply rejected successfully', 200, { requestId: req.id });
        return res.status(successResponse.statusCode).json(successResponse);
    } catch (error: any) {
        console.error('Error in rejectReply controller:', error);
        const errorResponse = createErrorResponse(error.message || 'Internal server error', ErrorCode.INTERNAL_SERVER_ERROR, 500, undefined, req.id);
        return res.status(errorResponse.statusCode).json(errorResponse);
    }
};
