import { Request, Response } from 'express';
import { createSuccessResponse, createErrorResponse, ErrorCode } from '@platform/contracts';
import * as ReviewService from '../services/review.service';

export const list = async (req: Request, res: Response) => {
    try {
        const businessId = req.params.id;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const platform = req.query.platform as string;

        const result = await ReviewService.listReviews(businessId, { page, limit, platform });
        const response = createSuccessResponse(result, 'Reviews fetched', 200, { requestId: req.id });
        res.status(response.statusCode).json(response);
    } catch (e: any) {
        const response = createErrorResponse(e.message, ErrorCode.INTERNAL_SERVER_ERROR, 500, undefined, req.id);
        res.status(response.statusCode).json(response);
    }
};

export const getStats = async (req: Request, res: Response) => {
    try {
        const businessId = req.params.id;
        const stats = await ReviewService.getReviewStats(businessId);
        const response = createSuccessResponse(stats, 'Review stats fetched', 200, { requestId: req.id });
        res.status(response.statusCode).json(response);
    } catch (e: any) {
        const response = createErrorResponse(e.message, ErrorCode.INTERNAL_SERVER_ERROR, 500, undefined, req.id);
        res.status(response.statusCode).json(response);
    }
};

export const reply = async (req: Request, res: Response) => {
    try {
        const businessId = req.params.id;
        const reviewId = req.params.reviewId;
        const { response } = req.body;

        if (!response) {
             const errorResponse = createErrorResponse('Response content is required', ErrorCode.VALIDATION_ERROR, 400, undefined, req.id);
             return res.status(errorResponse.statusCode).json(errorResponse);
        }

        const result = await ReviewService.replyReview(businessId, reviewId, response);
        const successResponse = createSuccessResponse(result, 'Review replied successfully', 200, { requestId: req.id });
        res.status(successResponse.statusCode).json(successResponse);
    } catch (e: any) {
        const response = createErrorResponse(e.message, ErrorCode.INTERNAL_SERVER_ERROR, 500, undefined, req.id);
        res.status(response.statusCode).json(response);
    }
};
