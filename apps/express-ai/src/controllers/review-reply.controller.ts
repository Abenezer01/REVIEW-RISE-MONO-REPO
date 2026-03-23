import { Request, Response } from 'express';
import { createSuccessResponse, createErrorResponse, ErrorCode } from '@platform/contracts';
import { ReviewReplyGeneratorService } from '../services/review-reply-generator.service';

const reviewReplyService = new ReviewReplyGeneratorService();

/**
 * POST /api/v1/review-reply/generate
 * Body: { reviewId: string, tone?: string, customBrandVoice?: string }
 */
export const generateReviewReply = async (req: Request, res: Response) => {
    try {
        const { reviewId, tone, customBrandVoice } = req.body;

        if (!reviewId) {
            const err = createErrorResponse('reviewId is required', ErrorCode.BAD_REQUEST, 400, undefined, req.id);
            return res.status(err.statusCode).json(err);
        }

        const variations = await reviewReplyService.generateReplyVariations(reviewId, {
            tonePreset: tone || 'Professional',
            customBrandVoice
        });

        const response = createSuccessResponse(variations, 'Reply variations generated', 200, { requestId: req.id });
        return res.status(response.statusCode).json(response);
    } catch (error: any) {
        console.error('[ReviewReplyController] Error:', error);
        const err = createErrorResponse(
            error.message || 'Failed to generate reply',
            ErrorCode.INTERNAL_SERVER_ERROR,
            500,
            undefined,
            req.id
        );
        return res.status(err.statusCode).json(err);
    }
};
