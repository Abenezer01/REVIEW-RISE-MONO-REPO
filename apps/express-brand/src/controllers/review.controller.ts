import { Request, Response } from 'express';
import { createSuccessResponse, createErrorResponse, ErrorCode } from '@platform/contracts';
import * as ReviewService from '../services/review.service';

export const list = async (req: Request, res: Response) => {
    const requestId = (req as any).id || crypto.randomUUID();
    try {
        const businessId = req.params.id;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const platform = req.query.platform as string;

        const result = await ReviewService.listReviews(businessId, { page, limit, platform });
        res.json(createSuccessResponse(result, 'Reviews fetched', 200, { requestId }));
    } catch (e: any) {
        res.status(500).json(createErrorResponse(e.message, ErrorCode.INTERNAL_SERVER_ERROR, 500, undefined, requestId));
    }
};

export const getStats = async (req: Request, res: Response) => {
    const requestId = (req as any).id || crypto.randomUUID();
    try {
        const businessId = req.params.id;
        const stats = await ReviewService.getReviewStats(businessId);
        res.json(createSuccessResponse(stats, 'Review stats fetched', 200, { requestId }));
    } catch (e: any) {
        res.status(500).json(createErrorResponse(e.message, ErrorCode.INTERNAL_SERVER_ERROR, 500, undefined, requestId));
    }
};

export const reply = async (req: Request, res: Response) => {
    const requestId = (req as any).id || crypto.randomUUID();
    try {
        const businessId = req.params.id;
        const reviewId = req.params.reviewId;
        const { response } = req.body;

        if (!response) {
             res.status(400).json(createErrorResponse('Response content is required', ErrorCode.VALIDATION_ERROR, 400, undefined, requestId));
             return;
        }

        const result = await ReviewService.replyReview(businessId, reviewId, response);
        res.json(createSuccessResponse(result, 'Review replied successfully', 200, { requestId }));
    } catch (e: any) {
        res.status(500).json(createErrorResponse(e.message, ErrorCode.INTERNAL_SERVER_ERROR, 500, undefined, requestId));
    }
};
